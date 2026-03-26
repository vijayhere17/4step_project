<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GroupBuiltupBonusController extends Controller
{
    // Dynamic daily group-builtup bonus from matching cycles and pair PV rules.

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

            $leftPv = $member->left_pv;
            $rightPv = $member->right_pv;

            $pairPv = 125;
            $incomePerPair = 125;

            $matchingPv = min($leftPv, $rightPv);

            $pairs = floor($matchingPv / $pairPv);

            if ($pairs <= 0) {
                continue;
            }

            $eligible++;

            $grossIncome = $pairs * $incomePerPair;

            DB::table('group_builtup_bonuses')->insert([
                'member_id' => $member->id,
                'cycle_date' => $cycleDate,
                'cycle_key' => $cycleKey,
                'matching_pv' => $pairs * $pairPv,
                'matched_pairs' => $pairs,
                'gross_income' => $grossIncome,
                'payable_income' => $grossIncome,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $totalIncome += $grossIncome;

            $usedPv = $pairs * $pairPv;

            DB::table('members')
                ->where('id', $member->id)
                ->update([
                    'left_pv' => $leftPv - $usedPv,
                    'right_pv' => $rightPv - $usedPv
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