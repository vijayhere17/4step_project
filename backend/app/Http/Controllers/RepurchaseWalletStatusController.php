<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RepurchaseWalletStatusController extends Controller
{
    private const CONSISTENCY_MONTHS = 5;
    private const MIN_MONTHLY_PURCHASE = 500.0;
    private const REWARD_PERCENTAGE = 25.0;

    public function index(Request $request)
    {
        $userId = $request->header('X-Auth-Member') ?: $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'User id missing'], 401);
        }

        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        if (!Schema::hasTable('purchases')) {
            return response()->json([
                'message' => 'Consistency status fetched',
                'data' => [
                    'user_id' => $member->user_id,
                    'fullname' => $member->fullname,
                    'minimum_monthly_purchase' => self::MIN_MONTHLY_PURCHASE,
                    'completed_months' => 0,
                    'reward_percentage' => self::REWARD_PERCENTAGE,
                    'reward_earned' => false,
                    'reward_amount' => 0,
                    'consistency_status' => 'Not Started',
                    'month_1_purchase' => 0,
                    'month_2_purchase' => 0,
                    'month_3_purchase' => 0,
                    'month_4_purchase' => 0,
                    'month_5_purchase' => 0,
                    'months' => [],
                    'transactions' => [],
                    'setup_required' => 'purchases table missing. Please run backend migrations.',
                ],
            ]);
        }

        $months = [];
        $completedMonths = 0;

        for ($index = 1; $index <= self::CONSISTENCY_MONTHS; $index++) {
            $monthDate = Carbon::now()->subMonths(self::CONSISTENCY_MONTHS - $index);
            $monthStart = $monthDate->copy()->startOfMonth()->toDateString();
            $monthEnd = $monthDate->copy()->endOfMonth()->toDateString();

            $amount = (float) DB::table('purchases')
                ->where('member_id', $member->id)
                ->whereBetween('purchase_date', [$monthStart, $monthEnd])
                ->sum('amount');

            $completed = $amount >= self::MIN_MONTHLY_PURCHASE;

            if ($completed) {
                $completedMonths++;
            }

            $months[] = [
                'month_index' => $index,
                'label' => 'Month ' . $index,
                'month_key' => $monthDate->format('Y-m'),
                'purchase_amount' => round($amount, 2),
                'minimum_required' => self::MIN_MONTHLY_PURCHASE,
                'completed' => $completed,
                'status' => $completed ? 'Completed' : 'Pending',
            ];
        }

        $rewardEarned = $completedMonths === self::CONSISTENCY_MONTHS;
        $monthFiveAmount = $months[self::CONSISTENCY_MONTHS - 1]['purchase_amount'] ?? 0;
        $rewardAmount = $rewardEarned
            ? round(($monthFiveAmount * self::REWARD_PERCENTAGE) / 100, 2)
            : 0;

        $consistencyStatus = 'Not Started';
        if ($completedMonths > 0 && !$rewardEarned) {
            $consistencyStatus = 'In Progress';
        }
        if ($rewardEarned) {
            $consistencyStatus = 'Achieved';
        }

        $transactions = [];
        if (Schema::hasTable('loyalty_bonuses')) {
            $bonusRows = DB::table('loyalty_bonuses')
                ->where('member_id', $member->id)
                ->where('type', 'consistency')
                ->orderByDesc('id')
                ->limit(100)
                ->get();

            foreach ($bonusRows as $row) {
                $transactions[] = [
                    'id' => $row->id,
                    'date' => $row->calculated_at ?: $row->created_at,
                    'description' => 'Consistency reward credited',
                    'credit_amount' => (float) ($row->bonus_amount ?? 0),
                    'debit_amount' => 0,
                    'balance_after' => null,
                ];
            }
        }

        return response()->json([
            'message' => 'Consistency status fetched',
            'data' => [
                'user_id' => $member->user_id,
                'fullname' => $member->fullname,
                'minimum_monthly_purchase' => self::MIN_MONTHLY_PURCHASE,
                'completed_months' => $completedMonths,
                'reward_percentage' => self::REWARD_PERCENTAGE,
                'reward_earned' => $rewardEarned,
                'reward_amount' => $rewardAmount,
                'consistency_status' => $consistencyStatus,
                'month_1_purchase' => $months[0]['purchase_amount'] ?? 0,
                'month_2_purchase' => $months[1]['purchase_amount'] ?? 0,
                'month_3_purchase' => $months[2]['purchase_amount'] ?? 0,
                'month_4_purchase' => $months[3]['purchase_amount'] ?? 0,
                'month_5_purchase' => $months[4]['purchase_amount'] ?? 0,
                'months' => $months,
                'transactions' => $transactions,
            ],
        ]);
    }

}