<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\RoyaltyClubBonus;
use App\Models\RoyaltySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class RoyaltyClubBonusController extends Controller
{
    private const DEFAULT_POOL_PERCENTAGE = 3.0;
    private const MIN_STEP_LEVEL = 4;
    private const MIN_MONTHLY_PURCHASE = 500;

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ Get Royalty Bonus History
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|exists:members,user_id',
            'month'   => 'nullable|date_format:Y-m',
            'limit'   => 'nullable|integer|min:1|max:200',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = RoyaltyClubBonus::with('member:id,user_id,fullname')
            ->orderByDesc('month_key')
            ->orderByDesc('id');

        if (!empty($validated['month'])) {
            $query->where('month_key', $validated['month']);
        }

        if (!empty($validated['user_id'])) {
            $member = Member::where('user_id', $validated['user_id'])->first();

            if (!$member) {
                return response()->json([
                    'message' => 'Member not found',
                    'data' => [],
                ], 404);
            }

            $query->where('member_id', $member->id);
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'transaction_id' => 'RCB' . str_pad($row->id, 6, '0', STR_PAD_LEFT),
                'date' => optional($row->calculated_at)->toDateString(),
                'month' => $row->month_key,
                'royalty_pool' => (float) $row->royalty_pool_amount,
                'earned' => (float) $row->bonus_amount,
                'status' => $row->status,
                'member_user_id' => optional($row->member)->user_id,
                'member_name' => optional($row->member)->fullname,
            ];
        });

        return response()->json([
            'message' => 'Royalty Club bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ Calculate Monthly Royalty Bonus
    |--------------------------------------------------------------------------
    */
    public function calculateMonthly(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
            'monthly_turnover' => 'required|numeric|min:0.01',
        ]);

        $monthKey = $validated['month'];
        $monthlyTurnover = (float) $validated['monthly_turnover'];

        try {
            $periodStart = Carbon::createFromFormat('Y-m', $monthKey)->startOfMonth();
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'month' => ['Invalid month format. Use Y-m (example: 2026-02).'],
            ]);
        }

        $periodEnd = $periodStart->copy()->endOfMonth();
        $normalizedMonthKey = $periodStart->format('Y-m');

        return DB::transaction(function () use (
            $normalizedMonthKey,
            $periodStart,
            $periodEnd,
            $monthlyTurnover
        ) {

            if (RoyaltyClubBonus::where('month_key', $normalizedMonthKey)->exists()) {
                throw ValidationException::withMessages([
                    'month' => ["Royalty Club Bonus already calculated for {$normalizedMonthKey}."],
                ]);
            }

            $poolPercentage = RoyaltySetting::getDecimalValue(
                'royalty_pool_percentage',
                self::DEFAULT_POOL_PERCENTAGE
            );

            $royaltyPoolAmount = round(($monthlyTurnover * $poolPercentage) / 100, 2);

            $eligibleQuery = Member::where('status', 1)
                ->where('step_level', '>=', self::MIN_STEP_LEVEL)
                ->where('monthly_purchase', '>=', self::MIN_MONTHLY_PURCHASE);

            $eligibleUsersCount = $eligibleQuery->count();

            if ($eligibleUsersCount == 0) {
                return response()->json([
                    'message' => 'No eligible members found.',
                    'data' => [],
                ]);
            }

            $perUserBonus = round($royaltyPoolAmount / $eligibleUsersCount, 2);
            $now = now();
            $insertData = [];

            $eligibleQuery->select('id')->chunkById(1000, function ($members) use (
                &$insertData,
                $normalizedMonthKey,
                $periodStart,
                $periodEnd,
                $monthlyTurnover,
                $poolPercentage,
                $royaltyPoolAmount,
                $eligibleUsersCount,
                $perUserBonus,
                $now
            ) {

                foreach ($members as $member) {
                    $insertData[] = [
                        'member_id' => $member->id,
                        'month_key' => $normalizedMonthKey,
                        'period_start' => $periodStart->toDateString(),
                        'period_end' => $periodEnd->toDateString(),
                        'monthly_turnover' => round($monthlyTurnover, 2),
                        'pool_percentage' => $poolPercentage,
                        'royalty_pool_amount' => $royaltyPoolAmount,
                        'eligible_users_count' => $eligibleUsersCount,
                        'bonus_amount' => $perUserBonus,
                        'status' => 'pending',
                        'calculated_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (!empty($insertData)) {
                    RoyaltyClubBonus::insert($insertData);
                    $insertData = [];
                }
            });

            return response()->json([
                'message' => 'Royalty Club bonus calculated successfully.',
                'data' => [
                    'month' => $normalizedMonthKey,
                    'period_start' => $periodStart->toDateString(),
                    'period_end' => $periodEnd->toDateString(),
                    'monthly_turnover' => round($monthlyTurnover, 2),
                    'pool_percentage' => $poolPercentage,
                    'royalty_pool_amount' => $royaltyPoolAmount,
                    'eligible_users_count' => $eligibleUsersCount,
                    'per_user_bonus' => $perUserBonus,
                ],
            ], 201);
        });
    }
}