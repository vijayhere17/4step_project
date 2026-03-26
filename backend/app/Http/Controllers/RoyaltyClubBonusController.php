<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\RoyaltyClubBonus;
use App\Models\RoyaltySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class RoyaltyClubBonusController extends Controller
{
    // Dynamic monthly royalty pool split for members who satisfy all eligibility rules.
    private const DEFAULT_POOL_PERCENTAGE = 3.0;
    private const MIN_STEP_LEVEL = 4;
    private const MIN_MONTHLY_PURCHASE = 500;
    private const MIN_DIRECT_REFERRALS = 6;
    private const MIN_DIRECT_REFERRAL_PV = 1000;

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
                'monthly_turnover' => (float) $row->monthly_turnover,
                'pool_percentage' => (float) $row->pool_percentage,
                'royalty_pool' => (float) $row->royalty_pool_amount,
                'eligible_users_count' => (int) $row->eligible_users_count,
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

    public function status(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|string|exists:members,user_id',
            'month' => 'nullable|date_format:Y-m',
        ]);

        $monthKey = $validated['month'] ?? now()->format('Y-m');
        $monthRange = $this->resolveMonthRange($monthKey);

        if (!$monthRange) {
            return response()->json([
                'message' => 'Invalid month format. Use Y-m.',
            ], 422);
        }

        $member = Member::query()->where('user_id', $validated['user_id'])->first();

        if (!$member) {
            return response()->json([
                'message' => 'Member not found',
            ], 404);
        }

        $poolPercentage = RoyaltySetting::getDecimalValue(
            'royalty_pool_percentage',
            self::DEFAULT_POOL_PERCENTAGE
        );

        $eligibility = $this->resolveMemberEligibility($member, $monthRange['start'], $monthRange['end']);

        $monthlyTurnover = $this->resolveMonthlyTurnover($monthKey, null);
        $royaltyPoolAmount = round(($monthlyTurnover * $poolPercentage) / 100, 2);

        $savedMonthRow = RoyaltyClubBonus::query()->where('month_key', $monthKey)->first();
        $eligibleUsersCount = $savedMonthRow
            ? (int) $savedMonthRow->eligible_users_count
            : $this->countEligibleMembers($monthRange['start'], $monthRange['end']);

        $estimatedIncome = ($eligibility['eligible'] && $eligibleUsersCount > 0)
            ? round($royaltyPoolAmount / $eligibleUsersCount, 2)
            : 0.0;

        $rows = RoyaltyClubBonus::query()
            ->where('member_id', $member->id)
            ->orderByDesc('month_key')
            ->orderByDesc('id')
            ->limit(12)
            ->get()
            ->map(function ($row, $index) {
                return [
                    'sr_no' => $index + 1,
                    'month' => $row->month_key,
                    'monthly_turnover' => (float) $row->monthly_turnover,
                    'pool_percentage' => (float) $row->pool_percentage,
                    'royalty_pool' => (float) $row->royalty_pool_amount,
                    'eligible_users_count' => (int) $row->eligible_users_count,
                    'earned' => (float) $row->bonus_amount,
                    'status' => $row->status,
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Royalty status fetched successfully.',
            'data' => [
                'month' => $monthKey,
                'required_step' => self::MIN_STEP_LEVEL,
                'minimum_monthly_purchase' => self::MIN_MONTHLY_PURCHASE,
                'required_direct_referrals' => self::MIN_DIRECT_REFERRALS,
                'minimum_direct_referral_pv' => self::MIN_DIRECT_REFERRAL_PV,
                'step_eligible' => $eligibility['step_eligible'],
                'monthly_purchase_met' => $eligibility['monthly_purchase_met'],
                'matching_bv_active' => $eligibility['matching_bv_active'],
                'qualified_direct_referrals' => $eligibility['qualified_direct_referrals'],
                'direct_referral_rule_met' => $eligibility['direct_referral_rule_met'],
                'eligible' => $eligibility['eligible'],
                'monthly_purchase' => $eligibility['monthly_purchase'],
                'monthly_turnover' => round($monthlyTurnover, 2),
                'pool_percentage' => $poolPercentage,
                'royalty_pool_amount' => $royaltyPoolAmount,
                'eligible_users_count' => $eligibleUsersCount,
                'estimated_income' => $estimatedIncome,
                'rows' => $rows,
            ],
        ]);
    }

    public function calculateMonthly(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
            'monthly_turnover' => 'nullable|numeric|min:0.01',
        ]);

        $monthKey = $validated['month'];

        $monthRange = $this->resolveMonthRange($monthKey);
        if (!$monthRange) {
            throw ValidationException::withMessages([
                'month' => ['Invalid month format. Use Y-m (example: 2026-02).'],
            ]);
        }

        $monthlyTurnover = $this->resolveMonthlyTurnover(
            $monthKey,
            isset($validated['monthly_turnover']) ? (float) $validated['monthly_turnover'] : null
        );

        if ($monthlyTurnover <= 0) {
            throw ValidationException::withMessages([
                'monthly_turnover' => ['Monthly turnover must be greater than 0.'],
            ]);
        }

        $periodStart = $monthRange['start'];
        $periodEnd = $monthRange['end'];
        $normalizedMonthKey = $monthRange['month_key'];

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

            $eligibleMemberIds = collect($this->resolveEligibleMemberIds($periodStart, $periodEnd));

            $eligibleUsersCount = $eligibleMemberIds->count();

            if ($eligibleUsersCount == 0) {
                return response()->json([
                    'message' => 'No eligible members found.',
                    'data' => [
                        'month' => $normalizedMonthKey,
                        'period_start' => $periodStart->toDateString(),
                        'period_end' => $periodEnd->toDateString(),
                        'monthly_turnover' => round($monthlyTurnover, 2),
                        'pool_percentage' => $poolPercentage,
                        'royalty_pool_amount' => $royaltyPoolAmount,
                        'eligible_users_count' => 0,
                        'per_user_bonus' => 0,
                    ],
                ]);
            }

            $perUserBonus = round($royaltyPoolAmount / $eligibleUsersCount, 2);
            $now = now();
            $insertData = [];

            foreach ($eligibleMemberIds as $memberId) {
                $insertData[] = [
                    'member_id' => (int) $memberId,
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
            }

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

    private function resolveMonthRange(string $monthKey): ?array
    {
        try {
            $start = Carbon::createFromFormat('Y-m', $monthKey)->startOfMonth();
            $end = $start->copy()->endOfMonth();

            return [
                'month_key' => $start->format('Y-m'),
                'start' => $start,
                'end' => $end,
            ];
        } catch (\Throwable $exception) {
            return null;
        }
    }

    private function resolveMemberStep(Member $member): int
    {
        return max((int) ($member->package_step ?? 0), (int) ($member->step_level ?? 0));
    }

    private function resolveMonthlyPurchase(int $memberId, Carbon $periodStart, Carbon $periodEnd): float
    {
        if (!Schema::hasTable('purchases')) {
            return 0;
        }

        return (float) DB::table('purchases')
            ->where('member_id', $memberId)
            ->whereBetween('purchase_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->sum('amount');
    }

    private function resolveHasMatchingBv(int $memberId, Carbon $periodStart, Carbon $periodEnd): bool
    {
        if (!Schema::hasTable('pv_matchings')) {
            return false;
        }

        $totalMatchedPv = (float) DB::table('pv_matchings')
            ->where('member_id', $memberId)
            ->where(function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('match_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->orWhere(function ($subQuery) use ($periodStart, $periodEnd) {
                        $subQuery->whereNull('match_date')
                            ->whereBetween('created_at', [$periodStart->toDateTimeString(), $periodEnd->toDateTimeString()]);
                    });
            })
            ->sum('matched_pv');

        return $totalMatchedPv > 0;
    }

    private function resolveMonthlyTurnover(string $monthKey, ?float $manualTurnover): float
    {
        if ($manualTurnover !== null) {
            return round(max(0, $manualTurnover), 2);
        }

        if (Schema::hasTable('company_turnovers')) {
            $stored = DB::table('company_turnovers')->where('month_key', $monthKey)->value('turnover_amount');
            if ($stored !== null) {
                return round((float) $stored, 2);
            }
        }

        return 0.0;
    }

    private function countEligibleMembers(Carbon $periodStart, Carbon $periodEnd): int
    {
        return count($this->resolveEligibleMemberIds($periodStart, $periodEnd));
    }

    private function resolveQualifiedDirectReferralCount(int $sponsorMemberId, Carbon $periodStart, Carbon $periodEnd): int
    {
        if (!Schema::hasTable('members') || !Schema::hasTable('pv_matchings')) {
            return 0;
        }

        $directMembers = Member::query()
            ->where('sponsor_id', $sponsorMemberId)
            ->where('status', 1)
            ->get();

        $eligibleDirectIds = $directMembers
            ->filter(function (Member $member) {
                return $this->resolveMemberStep($member) >= self::MIN_STEP_LEVEL;
            })
            ->pluck('id')
            ->all();

        if (empty($eligibleDirectIds)) {
            return 0;
        }

        return (int) DB::table('pv_matchings')
            ->whereIn('member_id', $eligibleDirectIds)
            ->where(function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('match_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->orWhere(function ($subQuery) use ($periodStart, $periodEnd) {
                        $subQuery->whereNull('match_date')
                            ->whereBetween('created_at', [$periodStart->toDateTimeString(), $periodEnd->toDateTimeString()]);
                    });
            })
            ->groupBy('member_id')
            ->havingRaw('SUM(COALESCE(matched_pv, 0)) >= ?', [self::MIN_DIRECT_REFERRAL_PV])
            ->select('member_id')
            ->get()
            ->count();
    }

    private function resolveEligibleMemberIds(Carbon $periodStart, Carbon $periodEnd): array
    {
        if (!Schema::hasTable('members')) {
            return [];
        }

        return Member::query()
            ->where('status', 1)
            ->get()
            ->filter(function (Member $member) use ($periodStart, $periodEnd) {
                $eligibility = $this->resolveMemberEligibility($member, $periodStart, $periodEnd);
                return $eligibility['eligible'] === true;
            })
            ->pluck('id')
            ->values()
            ->all();
    }

    private function resolveMemberEligibility(Member $member, Carbon $periodStart, Carbon $periodEnd): array
    {
        $memberStep = $this->resolveMemberStep($member);
        $isStepEligible = (int) $member->status === 1 && $memberStep >= self::MIN_STEP_LEVEL;
        $monthlyPurchase = round($this->resolveMonthlyPurchase($member->id, $periodStart, $periodEnd), 2);
        $hasPurchase = $monthlyPurchase >= self::MIN_MONTHLY_PURCHASE;
        $hasMatchingBv = $this->resolveHasMatchingBv($member->id, $periodStart, $periodEnd);
        $qualifiedDirectCount = $this->resolveQualifiedDirectReferralCount($member->id, $periodStart, $periodEnd);
        $hasQualifiedDirects = $qualifiedDirectCount >= self::MIN_DIRECT_REFERRALS;

        return [
            'step_eligible' => $isStepEligible,
            'monthly_purchase' => $monthlyPurchase,
            'monthly_purchase_met' => $hasPurchase,
            'matching_bv_active' => $hasMatchingBv,
            'qualified_direct_referrals' => $qualifiedDirectCount,
            'direct_referral_rule_met' => $hasQualifiedDirects,
            'eligible' => $isStepEligible && $hasPurchase && $hasMatchingBv && $hasQualifiedDirects,
        ];
    }
}