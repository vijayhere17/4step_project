<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Member;
use App\Models\DiwaliBonus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DiwaliBonusController extends Controller
{

   
    public function index(Request $request)
    {
        $user_id = $request->user_id;
        $limit = $request->limit ?? 100;

        $query = DiwaliBonus::with('member');

        if ($user_id) {
            $member = Member::where('user_id', $user_id)->first();

            if (!$member) {
                return response()->json([
                    "message" => "Member not found",
                    "data" => []
                ],404);
            }

            $query->where('member_id', $member->id);
        }

        $bonuses = $query->orderBy('id','desc')->limit($limit)->get();

        $data = [];

        foreach ($bonuses as $bonus) {

            $data[] = [
                "id" => $bonus->id,
                "transaction_id" => "DB" . str_pad($bonus->id,5,"0",STR_PAD_LEFT),
                "date" => $bonus->calculated_at 
                        ? $bonus->calculated_at->format('Y-m-d')
                        : null,
                "festival_year" => $bonus->bonus_year,
                "target_business" => $bonus->total_lapsed_pv,
                "percentage" => $bonus->bonus_percentage,
                "earned" => $bonus->bonus_amount,
                "status" => "Approved",
                "member_user_id" => $bonus->member->user_id ?? "--",
                "member_name" => $bonus->member->fullname ?? "--"
            ];
        }

        return response()->json([
            "message" => "Diwali bonus history",
            "data" => $data
        ]);
    }


   
    public function calculateYearly(Request $request)
    {
        $request->validate([
            "year" => "required|integer"
        ]);

        $year = $request->year;

        $startDate = Carbon::create($year,10,1);
        $endDate = Carbon::create($year,10,31);

        $bonusPercentage = 5;
        $eligibleStep = 4;

        $users = User::where('step_level','>=',$eligibleStep)->get();

        $processed = 0;
        $totalBonus = 0;

        foreach ($users as $user) {

            $lapsedPv = DB::table('pv_matchings')
                ->where('member_id',$user->id)
                ->whereBetween('created_at',[$startDate,$endDate])
                ->sum('lapsed_matching_pv');

            if ($lapsedPv <= 0) {
                continue;
            }

            $bonus = ($lapsedPv * $bonusPercentage) / 100;

            DiwaliBonus::create([
                "member_id" => $user->id,
                "bonus_year" => $year,
                "period_start" => $startDate,
                "period_end" => $endDate,
                "total_lapsed_pv" => $lapsedPv,
                "bonus_percentage" => $bonusPercentage,
                "bonus_amount" => $bonus,
                "calculated_at" => now()
            ]);

            $processed++;
            $totalBonus += $bonus;
        }

        return response()->json([
            "message" => "Diwali bonus calculated",
            "data" => [
                "year" => $year,
                "processed_members" => $processed,
                "total_bonus" => $totalBonus,
                "bonus_percentage" => $bonusPercentage
            ]
        ]);
    }
}