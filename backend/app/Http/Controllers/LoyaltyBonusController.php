<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoyaltyBonusController extends Controller
{

    
    public function index(Request $request)
    {
        $userId = $request->user_id;

        $query = DB::table('loyalty_bonuses')
            ->join('members', 'members.id', '=', 'loyalty_bonuses.member_id')
            ->select(
                'loyalty_bonuses.id',
                'loyalty_bonuses.month_key',
                'loyalty_bonuses.purchase_amount',
                'loyalty_bonuses.bonus_percentage',
                'loyalty_bonuses.bonus_amount',
                'loyalty_bonuses.type',
                'loyalty_bonuses.status',
                'members.user_id',
                'members.fullname'
            )
            ->orderBy('loyalty_bonuses.id', 'desc');

        if ($userId) {
            $query->where('members.user_id', $userId);
        }

        $data = $query->get()->map(function ($row) {

            return [
                'id' => $row->id,
                'transaction_id' => 'LB' . str_pad($row->id, 6, '0', STR_PAD_LEFT),
                'month' => $row->month_key,
                'repurchase_amount' => $row->purchase_amount,
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
        $month = $request->month;

        $monthStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $monthEnd = Carbon::createFromFormat('Y-m', $month)->endOfMonth();

        $minPurchase = 500;      // minimum purchase
        $bonusPercent = 20;      // bonus %

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

            $bonus = ($purchase * $bonusPercent) / 100;

            DB::table('loyalty_bonuses')->insert([
                'member_id' => $member->id,
                'month_key' => $month,
                'purchase_amount' => $purchase,
                'bonus_percentage' => $bonusPercent,
                'bonus_amount' => $bonus,
                'type' => 'monthly',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);

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
        $bonusPercent = 25;
        $minPurchase = 500;

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

            DB::table('loyalty_bonuses')->insert([
                'member_id' => $member->id,
                'month_key' => now()->format('Y-m'),
                'purchase_amount' => $totalPurchase,
                'bonus_percentage' => $bonusPercent,
                'bonus_amount' => $bonus,
                'type' => 'consistency',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);

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

}