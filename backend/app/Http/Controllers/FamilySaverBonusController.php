<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\RoyaltySetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FamilySaverBonusController extends Controller
{
    private const DEFAULT_PERCENTAGE = 1.0;
    private const INSERT_BATCH_SIZE = 2000;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|exists:members,user_id',
            'month' => 'nullable|date_format:Y-m',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = DB::table('family_saver_bonuses as fsb')
            ->leftJoin('members as nominee', 'nominee.id', '=', 'fsb.nominee_member_id')
            ->leftJoin('members as deceased', 'deceased.id', '=', 'fsb.deceased_member_id')
            ->select(
                'fsb.id',
                'fsb.month_key',
                'fsb.monthly_company_pv',
                'fsb.bonus_amount',
                'fsb.qualification_status',
                'fsb.status',
                'fsb.calculated_at',
                'nominee.user_id as nominee_user_id',
                'deceased.user_id as deceased_user_id',
                'deceased.fullname as deceased_fullname'
            )
            ->orderByDesc('fsb.month_key')
            ->orderByDesc('fsb.id');

        if (!empty($validated['month'])) {
            $query->where('fsb.month_key', $validated['month']);
        }

        if (!empty($validated['user_id'])) {
            $memberId = Member::query()->where('user_id', $validated['user_id'])->value('id');
            if ($memberId) {
                $query->where('fsb.nominee_member_id', $memberId);
            }
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            $status = strtolower((string) $row->status);
            $dateValue = !empty($row->calculated_at)
                ? Carbon::parse($row->calculated_at)->toDateString()
                : now()->toDateString();
            $deceasedMember = trim(implode(' - ', array_filter([
                (string) ($row->deceased_user_id ?? ''),
                (string) ($row->deceased_fullname ?? ''),
            ])));

            return [
                'id' => $row->id,
                'transaction_id' => 'FSB' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'date' => $dateValue,
                'family_id' => $row->nominee_user_id ?: ('FAM' . str_pad((string) $row->id, 4, '0', STR_PAD_LEFT)),
                'deceased_member' => $deceasedMember !== '' ? $deceasedMember : '-',
                'combined_business' => (float) $row->monthly_company_pv,
                'qualification_status' => $row->qualification_status,
                'earned' => (float) $row->bonus_amount,
                'status' => ucfirst((string) $row->status),
                'wallet' => $status === 'paid' ? 'Credited' : 'On Hold',
            ];
        });

        return response()->json([
            'message' => 'Family Saver bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }

    public function calculateMonthly(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        try {
            $monthStart = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Invalid month format. Use Y-m.',
            ], 422);
        }

        $monthKey = $monthStart->format('Y-m');
        $monthEnd = $monthStart->copy()->endOfMonth();

        $result = DB::transaction(function () use ($monthKey, $monthEnd) {
            $percentage = RoyaltySetting::getDecimalValue('family_saver_bonus_percentage', self::DEFAULT_PERCENTAGE);

            $companyPv = DB::table('company_pv_records')
                ->where('month_key', $monthKey)
                ->where('status', 'finalized')
                ->value('total_pv');

            if (!$companyPv || (float) $companyPv <= 0) {
                return [
                    'month' => $monthKey,
                    'processed_claims' => 0,
                    'inserted_rows' => 0,
                    'total_bonus_amount' => 0,
                    'message' => 'No finalized company PV found for this month.',
                ];
            }

            $bonusAmount = round(((float) $companyPv * (float) $percentage) / 100, 2);
            $insertRows = [];
            $processedClaims = 0;
            $insertedRows = 0;
            $now = now();

            DB::table('death_claims')
                ->select('id', 'deceased_member_id', 'nominee_member_id')
                ->where('verification_status', 'verified')
                ->whereNotNull('verified_at')
                ->whereDate('verified_at', '<=', $monthEnd->toDateString())
                ->orderBy('id')
                ->chunkById(self::INSERT_BATCH_SIZE, function ($claims) use (
                    &$insertRows,
                    &$processedClaims,
                    &$insertedRows,
                    $monthKey,
                    $companyPv,
                    $percentage,
                    $bonusAmount,
                    $now
                ) {
                    foreach ($claims as $claim) {
                        $processedClaims++;

                        $insertRows[] = [
                            'nominee_member_id' => (int) $claim->nominee_member_id,
                            'deceased_member_id' => (int) $claim->deceased_member_id,
                            'death_claim_id' => (int) $claim->id,
                            'month_key' => $monthKey,
                            'monthly_company_pv' => round((float) $companyPv, 2),
                            'bonus_percentage' => (float) $percentage,
                            'bonus_amount' => $bonusAmount,
                            'qualification_status' => 'Qualified',
                            'status' => 'pending',
                            'calculated_at' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];

                        if (count($insertRows) >= self::INSERT_BATCH_SIZE) {
                            $insertedRows += DB::table('family_saver_bonuses')->insertOrIgnore($insertRows);
                            $insertRows = [];
                        }
                    }
                }, 'id');

            if (!empty($insertRows)) {
                $insertedRows += DB::table('family_saver_bonuses')->insertOrIgnore($insertRows);
            }

            return [
                'month' => $monthKey,
                'monthly_company_pv' => round((float) $companyPv, 2),
                'bonus_percentage' => (float) $percentage,
                'per_nominee_bonus' => $bonusAmount,
                'processed_claims' => $processedClaims,
                'inserted_rows' => $insertedRows,
                'total_bonus_amount' => round($bonusAmount * $insertedRows, 2),
            ];
        });

        return response()->json([
            'message' => 'Family Saver bonus processed successfully.',
            'data' => $result,
        ], 201);
    }
}
