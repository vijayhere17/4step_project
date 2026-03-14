<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LeadershipRankBonusController extends Controller
{

  
    public function index(Request $request)
    {
        $userId = $request->user_id;

        $query = DB::table('leadership_rank_bonuses')
            ->join('members', 'members.id', '=', 'leadership_rank_bonuses.upline_member_id')
            ->select(
                'leadership_rank_bonuses.id',
                'leadership_rank_bonuses.cycle_date',
                'leadership_rank_bonuses.rank_name',
                'leadership_rank_bonuses.matching_income',
                'leadership_rank_bonuses.bonus_amount',
                'leadership_rank_bonuses.status',
                'members.user_id',
                'members.fullname'
            )
            ->orderBy('leadership_rank_bonuses.id', 'desc');

        if ($userId) {
            $query->where('members.user_id', $userId);
        }

        $data = $query->get()->map(function ($row) {

            return [
                'id' => $row->id,
                'transaction_id' => 'LRB' . str_pad($row->id, 6, '0', STR_PAD_LEFT),
                'date' => Carbon::parse($row->cycle_date)->format('Y-m-d'),
                'rank_name' => $row->rank_name,
                'business_volume' => $row->matching_income,
                'earned' => $row->bonus_amount,
                'status' => $row->status,
                'user_id' => $row->user_id,
                'name' => $row->fullname
            ];
        });

        return response()->json([
            'message' => 'Leadership bonus history fetched',
            'data' => $data
        ]);
    }

    public function calculateCycle(Request $request)
    {
        $cycleDate = $request->cycle_date;

        $pvMatchings = DB::table('pv_matchings')
            ->whereDate('created_at', $cycleDate)
            ->where('matching_income', '>', 0)
            ->get();

        $processed = 0;
        $generated = 0;
        $totalBonus = 0;

        foreach ($pvMatchings as $match) {

            $processed++;

            $member = DB::table('members')
                ->where('id', $match->member_id)
                ->first();

            if (!$member || !$member->sponsor_id) {
                continue;
            }

            $upline = DB::table('members')
                ->where('id', $member->sponsor_id)
                ->first();

            if (!$upline) {
                continue;
            }

            $matchingIncome = $match->matching_income;

            $percentage = 10; // example %

            $bonus = ($matchingIncome * $percentage) / 100;

            DB::table('leadership_rank_bonuses')->insert([

                'upline_member_id' => $upline->id,
                'source_member_id' => $member->id,
                'cycle_date' => $cycleDate,
                'matching_income' => $matchingIncome,
                'bonus_percentage' => $percentage,
                'bonus_amount' => $bonus,
                'rank_name' => 'Leader',
                'generation_no' => 1,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()

            ]);

            $generated++;
            $totalBonus += $bonus;
        }

        return response()->json([
            'message' => 'Leadership bonus calculated',
            'data' => [
                'cycle_date' => $cycleDate,
                'processed_rows' => $processed,
                'generated_rows' => $generated,
                'total_bonus' => $totalBonus
            ]
        ]);
    }

}