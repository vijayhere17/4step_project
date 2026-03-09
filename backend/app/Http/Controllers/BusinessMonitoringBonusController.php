<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\PvMatching;
use App\Models\RoyaltySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BusinessMonitoringBonusController extends Controller
{
    private const DEFAULT_PERCENTAGE = 10.0;
    private const INSERT_BATCH_SIZE = 2000;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'sponsor_user_id' => 'nullable|string|exists:members,user_id',
            'cycle_date' => 'nullable|date_format:Y-m-d',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = DB::table('business_monitoring_bonuses as bmb')
            ->leftJoin('members as s', 's.id', '=', 'bmb.sponsor_member_id')
            ->leftJoin('members as d', 'd.id', '=', 'bmb.downline_member_id')
            ->select(
                'bmb.id',
                'bmb.sponsor_member_id',
                'bmb.cycle_date',
                'bmb.matching_income',
                'bmb.bonus_percentage',
                'bmb.bonus_amount',
                'bmb.status',
                'bmb.calculated_at',
                's.user_id as sponsor_user_id',
                's.fullname as sponsor_name',
                'd.user_id as downline_user_id',
                'd.fullname as downline_name'
            )
            ->orderByDesc('bmb.cycle_date')
            ->orderByDesc('bmb.id');

        if (!empty($validated['cycle_date'])) {
            $query->whereDate('bmb.cycle_date', $validated['cycle_date']);
        }

        if (!empty($validated['sponsor_user_id'])) {
            $sponsorId = Member::query()
                ->where('user_id', $validated['sponsor_user_id'])
                ->value('id');

            if ($sponsorId) {
                $query->where('bmb.sponsor_member_id', $sponsorId);
            }
        }

        $rows = $query->limit($limit)->get();

        $sponsorIds = $rows
            ->pluck('sponsor_member_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $directActiveMap = [];
        $teamActiveMap = [];

        if (!empty($sponsorIds)) {
            $directActiveMap = Member::query()
                ->whereIn('sponsor_id', $sponsorIds)
                ->where('status', 1)
                ->selectRaw('sponsor_id, COUNT(*) as total')
                ->groupBy('sponsor_id')
                ->pluck('total', 'sponsor_id')
                ->map(fn ($count) => (int) $count)
                ->all();

            try {
                $placeholders = implode(',', array_fill(0, count($sponsorIds), '?'));

                $teamSql = "
                    WITH RECURSIVE team_tree AS (
                        SELECT
                            m.id,
                            m.parent_id,
                            m.status,
                            m.parent_id AS root_sponsor_id
                        FROM members m
                        WHERE m.parent_id IN ({$placeholders})

                        UNION ALL

                        SELECT
                            child.id,
                            child.parent_id,
                            child.status,
                            tree.root_sponsor_id
                        FROM members child
                        INNER JOIN team_tree tree ON child.parent_id = tree.id
                    )
                    SELECT
                        root_sponsor_id AS sponsor_id,
                        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active_team_count
                    FROM team_tree
                    GROUP BY root_sponsor_id
                ";

                $teamRows = DB::select($teamSql, $sponsorIds);

                foreach ($teamRows as $teamRow) {
                    $teamActiveMap[(int) $teamRow->sponsor_id] = (int) $teamRow->active_team_count;
                }
            } catch (\Throwable $exception) {
                foreach ($directActiveMap as $sponsorId => $count) {
                    $teamActiveMap[(int) $sponsorId] = (int) $count;
                }
            }
        }

        $rows = $rows->map(function ($row) use ($directActiveMap, $teamActiveMap) {
            $sponsorId = (int) ($row->sponsor_member_id ?? 0);

            return [
                'id' => $row->id,
                'transaction_id' => 'BMB' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'cycle_date' => $row->cycle_date,
                'matching_income' => (float) $row->matching_income,
                'bonus_percentage' => (float) $row->bonus_percentage,
                'bonus_amount' => (float) $row->bonus_amount,
                'direct_active' => $directActiveMap[$sponsorId] ?? 0,
                'team_active' => $teamActiveMap[$sponsorId] ?? 0,
                'status' => $row->status,
                'calculated_at' => $row->calculated_at,
                'sponsor_user_id' => $row->sponsor_user_id,
                'sponsor_name' => $row->sponsor_name,
                'downline_user_id' => $row->downline_user_id,
                'downline_name' => $row->downline_name,
            ];
        });

        return response()->json([
            'message' => 'Business Monitoring bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }

    public function calculateCycle(Request $request)
    {
        $validated = $request->validate([
            'cycle_date' => 'required|date_format:Y-m-d',
            'bonus_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $result = $this->processCycle(
            $validated['cycle_date'],
            isset($validated['bonus_percentage']) ? (float) $validated['bonus_percentage'] : null
        );

        return response()->json([
            'message' => 'Business Monitoring bonus calculated successfully.',
            'data' => $result,
        ], 201);
    }

    public function runCycle(string $cycleDate, ?float $overridePercentage = null): array
    {
        return $this->processCycle($cycleDate, $overridePercentage);
    }

    private function processCycle(string $cycleDate, ?float $overridePercentage = null): array
    {
        $bonusPercentage = $overridePercentage ?? RoyaltySetting::getDecimalValue(
            'business_monitoring_bonus_percentage',
            self::DEFAULT_PERCENTAGE
        );

        $incomeColumn = Schema::hasColumn('pv_matchings', 'matching_income')
            ? 'matching_income'
            : 'lapsed_matching_pv';

        return DB::transaction(function () use ($cycleDate, $bonusPercentage, $incomeColumn) {
            $now = now();
            $rowsForInsert = [];
            $generatedRows = 0;
            $insertedRows = 0;
            $totalMatchingIncome = 0.0;
            $totalBonus = 0.0;

            $query = PvMatching::query()
                ->from('pv_matchings as pm')
                ->join('members as d', 'd.id', '=', 'pm.member_id')
                ->join('members as s', function ($join) {
                    $join->on('s.id', '=', 'd.sponsor_id')
                        ->where('s.status', '=', 1);
                })
                ->leftJoin('business_monitoring_bonuses as bmb', function ($join) use ($cycleDate) {
                    $join->on('bmb.sponsor_member_id', '=', 'd.sponsor_id')
                        ->on('bmb.downline_member_id', '=', 'pm.member_id')
                        ->whereDate('bmb.cycle_date', '=', $cycleDate);
                })
                ->whereDate('pm.created_at', $cycleDate)
                ->whereNull('bmb.id')
                ->groupBy('d.sponsor_id', 'pm.member_id')
                ->selectRaw('d.sponsor_id as sponsor_member_id')
                ->selectRaw('pm.member_id as downline_member_id')
                ->selectRaw("SUM(pm.{$incomeColumn}) as total_matching_income")
                ->havingRaw("SUM(pm.{$incomeColumn}) > 0")
                ->orderBy('d.sponsor_id');

            foreach ($query->cursor() as $item) {
                $matchingIncome = round((float) $item->total_matching_income, 2);
                $bonusAmount = round(($matchingIncome * $bonusPercentage) / 100, 2);

                $rowsForInsert[] = [
                    'sponsor_member_id' => (int) $item->sponsor_member_id,
                    'downline_member_id' => (int) $item->downline_member_id,
                    'cycle_date' => $cycleDate,
                    'matching_income' => $matchingIncome,
                    'bonus_percentage' => $bonusPercentage,
                    'bonus_amount' => $bonusAmount,
                    'status' => 'pending',
                    'calculated_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $generatedRows++;
                $totalMatchingIncome += $matchingIncome;
                $totalBonus += $bonusAmount;

                if (count($rowsForInsert) >= self::INSERT_BATCH_SIZE) {
                    $insertedRows += DB::table('business_monitoring_bonuses')->insertOrIgnore($rowsForInsert);
                    $rowsForInsert = [];
                }
            }

            if (!empty($rowsForInsert)) {
                $insertedRows += DB::table('business_monitoring_bonuses')->insertOrIgnore($rowsForInsert);
            }

            return [
                'cycle_date' => $cycleDate,
                'bonus_percentage' => $bonusPercentage,
                'income_source_column' => $incomeColumn,
                'generated_rows' => $generatedRows,
                'inserted_rows' => $insertedRows,
                'total_matching_income' => round($totalMatchingIncome, 2),
                'total_bonus_amount' => round($totalBonus, 2),
            ];
        });
    }
}
