<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class GroupBuiltupBonusController extends Controller
{
    private const PAIR_PV = 250;
    private const INCOME_PER_PAIR = 200;   
    private const DAILY_CAP = 2500;        

    /*
    |--------------------------------------------------------------------------
    | Get Group Built-Up Bonus History
    |--------------------------------------------------------------------------
    */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|exists:members,user_id',
            'cycle_date' => 'nullable|date_format:Y-m-d',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = DB::table('group_builtup_bonuses as gbb')
            ->join('members as m', 'm.id', '=', 'gbb.member_id')
            ->select(
                'gbb.id',
                'gbb.cycle_date',
                'gbb.cycle_key',
                'gbb.gross_income',
                'gbb.payable_income',
                'gbb.status',
                'gbb.calculated_at',
                'm.user_id as member_user_id'
            )
            ->orderByDesc('gbb.cycle_date')
            ->orderByDesc('gbb.id');

        if (!empty($validated['cycle_date'])) {
            $query->whereDate('gbb.cycle_date', $validated['cycle_date']);
        }

        if (!empty($validated['user_id'])) {
            $query->where('m.user_id', $validated['user_id']);
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            return [
                'id' => (int) $row->id,
                'date' => Carbon::parse($row->calculated_at)->toDateString(),
                'transaction_id' => 'GBB' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'group_period' => (string) $row->cycle_key,
                'direct_active' => 0,
                'team_active' => 0,
                'group_amount' => (float) $row->gross_income,
                'earned' => (float) $row->payable_income,
                'status' => (string) $row->status,
                'member_user_id' => (string) $row->member_user_id,
            ];
        });

        return response()->json([
            'message' => 'Group Builtup bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Group Built-Up Bonus
    |--------------------------------------------------------------------------
    */

    public function calculateCycle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cycle_date' => 'required|date_format:Y-m-d',
        ]);

        $result = $this->runCycle($validated['cycle_date']);

        return response()->json([
            'message' => 'Group Builtup bonus calculated successfully.',
            'data' => $result,
        ], 201);
    }

    public function runCycle(string $cycleDate): array
    {
        $cycleDate = Carbon::parse($cycleDate)->toDateString();
        $cycleKey = Carbon::parse($cycleDate)->format('M Y');

        return DB::transaction(function () use ($cycleDate, $cycleKey) {

            if (DB::table('group_builtup_bonuses')
                ->whereDate('cycle_date', $cycleDate)
                ->exists()) {

                throw ValidationException::withMessages([
                    'cycle_date' => ["Bonus already calculated for {$cycleDate}."]
                ]);
            }

            $processed = 0;
            $eligible = 0;
            $totalGross = 0;
            $totalPayable = 0;
            $totalLapsed = 0;

            DB::table('members')
                ->where('status', 1)
                ->orderBy('id')
                ->chunkById(1000, function ($members) use (
                    $cycleDate,
                    $cycleKey,
                    &$processed,
                    &$eligible,
                    &$totalGross,
                    &$totalPayable,
                    &$totalLapsed
                ) {
                    foreach ($members as $member) {
                        $processed++;

                        $leftPv = (float) $member->left_pv;
                        $rightPv = (float) $member->right_pv;

                        $matchingPv = min($leftPv, $rightPv);

                        $pairs = (int) floor($matchingPv / self::PAIR_PV);

                        if ($pairs <= 0) {
                            continue;
                        }

                        $eligible++;

                        $grossIncome = $pairs * self::INCOME_PER_PAIR;

                        $payableIncome = min($grossIncome, self::DAILY_CAP);

                        $lapsedIncome = $grossIncome - $payableIncome;

                        $usedPv = $pairs * self::PAIR_PV;

                        DB::table('members')
                            ->where('id', $member->id)
                            ->update([
                                'left_pv' => max($leftPv - $usedPv, 0),
                                'right_pv' => max($rightPv - $usedPv, 0),
                                'updated_at' => now(),
                            ]);

                        DB::table('group_builtup_bonuses')->insert([
                            'member_id' => $member->id,
                            'cycle_date' => $cycleDate,
                            'cycle_key' => $cycleKey,
                            'matching_pv' => $pairs * self::PAIR_PV,
                            'matched_pairs' => $pairs,
                            'gross_income' => $grossIncome,
                            'daily_cap' => self::DAILY_CAP,
                            'income_per_pair' => self::INCOME_PER_PAIR,
                            'payable_income' => $payableIncome,
                            'lapsed_income' => $lapsedIncome,
                            'status' => 'pending',
                            'calculated_at' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $totalGross += $grossIncome;
                        $totalPayable += $payableIncome;
                        $totalLapsed += $lapsedIncome;
                    }
                }, 'id');

            return [
                'cycle_date' => $cycleDate,
                'pair_pv' => self::PAIR_PV,
                'processed_members' => $processed,
                'eligible_members' => $eligible,
                'total_gross_income' => round($totalGross, 2),
                'total_payable_income' => round($totalPayable, 2),
                'total_lapsed_income' => round($totalLapsed, 2),
            ];
        });
    }
}