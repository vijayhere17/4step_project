<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class LoyaltyBonusController extends Controller
{
    // Dynamic loyalty bonuses from monthly repurchase and consistency purchase rules.
    private const MIN_MONTHLY_PURCHASE = 500.0;
    private const DEFAULT_MONTHLY_BONUS_PERCENTAGE = 10.0;

    public function repurchaseStatus(Request $request)
    {
        $userId = $request->header('X-Auth-Member') ?: $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'User id missing'], 401);
        }

        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $month = $request->query('month') ?: now()->format('Y-m');
        $monthRange = $this->resolveMonthRange($month);

        if (!$monthRange) {
            return response()->json(['message' => 'Invalid month format, expected Y-m'], 422);
        }

        if (!Schema::hasTable('purchases')) {
            return response()->json([
                'message' => 'Repurchase status fetched',
                'data' => [
                    'month' => $month,
                    'minimum_purchase_required' => self::MIN_MONTHLY_PURCHASE,
                    'monthly_purchase_amount' => 0,
                    'eligible' => false,
                    'cashback_eligible' => false,
                    'loyalty_bonus_eligible' => false,
                    'royalty_eligible' => false,
                    'bonus_percentage' => self::DEFAULT_MONTHLY_BONUS_PERCENTAGE,
                    'estimated_loyalty_bonus' => 0,
                    'purchases' => [],
                ],
            ]);
        }

        $purchaseRows = DB::table('purchases')
            ->where('member_id', $member->id)
            ->whereBetween('purchase_date', [$monthRange['start']->toDateString(), $monthRange['end']->toDateString()])
            ->orderByDesc('purchase_date')
            ->orderByDesc('id')
            ->get();

        $monthlyPurchase = (float) $purchaseRows->sum('amount');
        $isEligible = $monthlyPurchase >= self::MIN_MONTHLY_PURCHASE;
        $estimatedBonus = round(($monthlyPurchase * self::DEFAULT_MONTHLY_BONUS_PERCENTAGE) / 100, 2);

        $purchases = $purchaseRows->map(function ($row, $index) {
            return [
                'id' => $row->id,
                'sr_no' => $index + 1,
                'invoice_no' => $row->invoice_no ?: ('INV-' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT)),
                'purchase_date' => $row->purchase_date,
                'amount' => (float) ($row->amount ?? 0),
                'status' => $row->status ?? 'approved',
            ];
        })->values();

        return response()->json([
            'message' => 'Repurchase status fetched',
            'data' => [
                'month' => $month,
                'minimum_purchase_required' => self::MIN_MONTHLY_PURCHASE,
                'monthly_purchase_amount' => round($monthlyPurchase, 2),
                'eligible' => $isEligible,
                'cashback_eligible' => $isEligible,
                'loyalty_bonus_eligible' => $isEligible,
                'royalty_eligible' => $isEligible,
                'bonus_percentage' => self::DEFAULT_MONTHLY_BONUS_PERCENTAGE,
                'estimated_loyalty_bonus' => $isEligible ? $estimatedBonus : 0,
                'purchases' => $purchases,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $type = $request->query('type');

        $query = DB::table('loyalty_bonuses')
            ->join('members', 'members.id', '=', 'loyalty_bonuses.member_id')
            ->select(
                'loyalty_bonuses.id',
                'loyalty_bonuses.month_key',
                'loyalty_bonuses.purchase_amount',
                'loyalty_bonuses.minimum_required',
                'loyalty_bonuses.requirement_met',
                'loyalty_bonuses.bonus_percentage',
                'loyalty_bonuses.bonus_amount',
                'loyalty_bonuses.type',
                'loyalty_bonuses.status',
                'loyalty_bonuses.calculated_at',
                'loyalty_bonuses.created_at',
                'members.user_id',
                'members.fullname'
            )
            ->orderBy('loyalty_bonuses.id', 'desc');

        if ($userId) {
            $query->where('members.user_id', $userId);
        }

        if ($type) {
            $query->where('loyalty_bonuses.type', $type);
        }

        $data = $query->get()->map(function ($row) {
            $date = $row->calculated_at ?: $row->created_at;

            return [
                'id' => $row->id,
                'transaction_id' => 'LB' . str_pad($row->id, 6, '0', STR_PAD_LEFT),
                'date' => $date ? Carbon::parse($date)->format('Y-m-d') : null,
                'month' => $row->month_key,
                'repurchase_amount' => $row->purchase_amount,
                'minimum_required' => (float) ($row->minimum_required ?? self::MIN_MONTHLY_PURCHASE),
                'requirement_met' => (bool) ($row->requirement_met ?? false),
                'percentage' => $row->bonus_percentage,
                'earned' => $row->bonus_amount,
                'type' => $row->type,
                'status' => $row->status,
                'user_id' => $row->user_id,
                'name' => $row->fullname
            ];
        });

        return response()->json([
            'message' => 'Loyalty bonus history fetched',
            'data' => $data
        ]);
    }



   
    public function calculateMonthly(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        if (!Schema::hasTable('loyalty_bonuses') || !Schema::hasTable('purchases')) {
            return response()->json([
                'message' => 'Required tables are missing. Please run migrations first.',
            ], 422);
        }

        $month = $validated['month'];

        $monthStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $monthEnd = Carbon::createFromFormat('Y-m', $month)->endOfMonth();

        $minPurchase = self::MIN_MONTHLY_PURCHASE;
        $bonusPercent = self::DEFAULT_MONTHLY_BONUS_PERCENTAGE;

        $members = DB::table('members')
            ->where('status', 1)
            ->get();

        $processed = 0;
        $eligible = 0;
        $totalBonus = 0;

        foreach ($members as $member) {

            $processed++;

            $purchase = DB::table('purchases')
                ->where('member_id', $member->id)
                ->whereBetween('purchase_date', [$monthStart, $monthEnd])
                ->sum('amount');

            if ($purchase < $minPurchase) {
                continue;
            }

            $eligible++;

            $bonus = round(($purchase * $bonusPercent) / 100, 2);

            DB::table('loyalty_bonuses')->updateOrInsert(
                [
                    'member_id' => $member->id,
                    'month_key' => $month,
                    'type' => 'monthly',
                ],
                [
                    'purchase_amount' => $purchase,
                    'minimum_required' => $minPurchase,
                    'requirement_met' => true,
                    'bonus_percentage' => $bonusPercent,
                    'bonus_amount' => $bonus,
                    'status' => 'pending',
                    'calculated_at' => now(),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $totalBonus += $bonus;
        }

        return response()->json([
            'message' => 'Monthly loyalty bonus calculated',
            'data' => [
                'month' => $month,
                'processed_members' => $processed,
                'eligible_members' => $eligible,
                'total_bonus' => $totalBonus
            ]
        ]);
    }


    public function calculateConsistencyBonus()
    {
        if (!Schema::hasTable('loyalty_bonuses') || !Schema::hasTable('purchases')) {
            return response()->json([
                'message' => 'Required tables are missing. Please run migrations first.',
            ], 422);
        }

        $bonusPercent = 25;
        $minPurchase = self::MIN_MONTHLY_PURCHASE;

        $members = DB::table('members')
            ->where('status', 1)
            ->get();

        $qualified = 0;
        $totalBonus = 0;

        foreach ($members as $member) {

            $months = [];

            for ($i = 1; $i <= 4; $i++) {

                $month = now()->subMonths($i);

                $purchase = DB::table('purchases')
                    ->where('member_id', $member->id)
                    ->whereYear('purchase_date', $month->year)
                    ->whereMonth('purchase_date', $month->month)
                    ->sum('amount');

                $months[] = $purchase;
            }

            if (min($months) < $minPurchase) {
                continue;
            }

            $totalPurchase = array_sum($months);

            $bonus = ($totalPurchase * $bonusPercent) / 100;

            DB::table('loyalty_bonuses')->updateOrInsert(
                [
                    'member_id' => $member->id,
                    'month_key' => now()->format('Y-m'),
                    'type' => 'consistency',
                ],
                [
                    'purchase_amount' => $totalPurchase,
                    'minimum_required' => $minPurchase,
                    'requirement_met' => true,
                    'bonus_percentage' => $bonusPercent,
                    'bonus_amount' => $bonus,
                    'status' => 'pending',
                    'calculated_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $qualified++;
            $totalBonus += $bonus;
        }

        return response()->json([
            'message' => 'Consistency bonus calculated',
            'data' => [
                'qualified_members' => $qualified,
                'total_bonus' => $totalBonus
            ]
        ]);
    }

    private function resolveMonthRange(string $month): ?array
    {
        try {
            $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $end = (clone $start)->endOfMonth();

            return [
                'start' => $start,
                'end' => $end,
            ];
        } catch (\Throwable $exception) {
            return null;
        }
    }

}