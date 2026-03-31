<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GroupBuiltupBonusController extends Controller
{
    // Dynamic daily group-builtup bonus from matching cycles and pair PV rules.

    private const STEP_CONFIG = [
        1 => ['pair_pv' => 125, 'cycle_cap' => 500, 'daily_cap' => 1000],
        2 => ['pair_pv' => 250, 'cycle_cap' => 1000, 'daily_cap' => 2000],
        3 => ['pair_pv' => 500, 'cycle_cap' => 2000, 'daily_cap' => 4000],
        4 => ['pair_pv' => 1000, 'cycle_cap' => 5000, 'daily_cap' => 10000],
        5 => ['pair_pv' => 2000, 'cycle_cap' => 10000, 'daily_cap' => 20000],
        6 => ['pair_pv' => 4000, 'cycle_cap' => 20000, 'daily_cap' => 40000],
    ];

    private const DEFAULT_INCOME_PER_PAIR = 125.0;

    public function runCycle(string $cycleDate): array
    {
        $request = Request::create('/api/bonuses/group-builtup/calculate', 'POST', [
            'cycle_date' => $cycleDate,
        ]);

        $response = $this->calculateCycle($request);
        $payload = $response->getData(true);
        $data = $payload['data'] ?? [];

        return [
            'cycle_date' => $data['cycle_date'] ?? $cycleDate,
            'pair_pv' => 125,
            'processed_members' => (int) ($data['processed_members'] ?? 0),
            'eligible_members' => (int) ($data['eligible_members'] ?? 0),
            'total_gross_income' => (float) ($data['total_income'] ?? 0),
            'total_payable_income' => (float) ($data['total_income'] ?? 0),
            'total_lapsed_income' => 0.0,
        ];
    }

    
    public function index(Request $request)
    {
        $userId = $request->user_id;

        $query = DB::table('group_builtup_bonuses')
            ->join('members', 'members.id', '=', 'group_builtup_bonuses.member_id')
            ->select(
                'group_builtup_bonuses.id',
                'group_builtup_bonuses.cycle_date',
                'group_builtup_bonuses.cycle_key',
                'group_builtup_bonuses.gross_income',
                'group_builtup_bonuses.payable_income',
                'group_builtup_bonuses.status',
                'members.user_id'
            )
            ->orderBy('group_builtup_bonuses.id', 'desc');

        if ($userId) {
            $query->where('members.user_id', $userId);
        }

        $data = $query->get()->map(function ($row) {

            return [
                'id' => $row->id,
                'date' => Carbon::parse($row->cycle_date)->format('Y-m-d'),
                'transaction_id' => 'GBB' . str_pad($row->id, 6, '0', STR_PAD_LEFT),
                'group_period' => $row->cycle_key,
                'group_amount' => $row->gross_income,
                'earned' => $row->payable_income,
                'status' => $row->status,
                'user_id' => $row->user_id
            ];
        });

        return response()->json([
            'message' => 'Bonus history fetched successfully',
            'data' => $data
        ]);
    }


  
    public function calculateCycle(Request $request)
    {
        $cycleDate = $request->cycle_date;

        $cycleKey = Carbon::parse($cycleDate)->format('M Y');

        $members = DB::table('members')
            ->where('status', 1)
            ->get();

        $processed = 0;
        $eligible = 0;
        $totalIncome = 0;

        foreach ($members as $member) {

            $processed++;

            $leftPv = (float) ($member->builtup_left_pv ?? 0);
            $rightPv = (float) ($member->builtup_right_pv ?? 0);

            if ($leftPv <= 0 || $rightPv <= 0) {
                continue;
            }

            $stepLevel = (int) ($member->package_step ?? 0);
            $stepConfig = self::STEP_CONFIG[$stepLevel] ?? self::STEP_CONFIG[1];

            $pairPv = (float) $stepConfig['pair_pv'];
            $cycleCap = (float) $stepConfig['cycle_cap'];
            $dailyCap = (float) $stepConfig['daily_cap'];
            $incomePerPair = self::DEFAULT_INCOME_PER_PAIR;

            $matchingPv = min($leftPv, $rightPv);

            $pairs = floor($matchingPv / $pairPv);

            if ($pairs <= 0) {
                continue;
            }

            $eligible++;

            $grossIncome = $pairs * $incomePerPair;
            $payableIncome = min($grossIncome, $cycleCap, $dailyCap);
            $lapsedIncome = max(0, $grossIncome - $payableIncome);

            $lapsedPairs = (int) floor($lapsedIncome / $incomePerPair);
            $lapsedPv = $lapsedPairs * $pairPv;
            $usedPv = $pairs * $pairPv;

            DB::table('group_builtup_bonuses')->insert([
                'member_id' => $member->id,
                'cycle_date' => $cycleDate,
                'cycle_key' => $cycleKey,
                'step_level' => $stepLevel,
                'left_pv_before' => $leftPv,
                'right_pv_before' => $rightPv,
                'matching_pv' => $pairs * $pairPv,
                'matched_pairs' => $pairs,
                'income_per_pair' => $incomePerPair,
                'gross_income' => $grossIncome,
                'daily_cap' => $dailyCap,
                'payable_income' => $payableIncome,
                'lapsed_income' => $lapsedIncome,
                'lapsed_pv' => $lapsedPv,
                'left_pv_after' => max(0, $leftPv - $usedPv),
                'right_pv_after' => max(0, $rightPv - $usedPv),
                'status' => 'pending',
                'calculated_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $totalIncome += $payableIncome;

            DB::table('members')
                ->where('id', $member->id)
                ->update([
                    'builtup_left_pv' => max(0, $leftPv - $usedPv),
                    'builtup_right_pv' => max(0, $rightPv - $usedPv)
                ]);
        }

        return response()->json([
            'message' => 'Bonus calculated successfully',
            'data' => [
                'cycle_date' => $cycleDate,
                'processed_members' => $processed,
                'eligible_members' => $eligible,
                'total_income' => $totalIncome
            ]
        ]);
    }

}