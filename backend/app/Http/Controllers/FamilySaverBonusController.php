<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FamilySaverBonusController extends Controller
{
    // Dynamic monthly family-saver bonus distribution to verified nominee claims.

    public function index(Request $request)
    {
        $user_id = $request->user_id;
        $month = $request->month;

        $query = DB::table('family_saver_bonuses')
            ->leftJoin('members','members.id','=','family_saver_bonuses.deceased_member_id')
            ->select(
                'family_saver_bonuses.*',
                'members.fullname as deceased_member_name'
            );

        if ($month) {
            $query->where('family_saver_bonuses.month_key', $month);
        }

        if ($user_id) {
            $member = Member::where('user_id', $user_id)->first();

            if ($member) {
                $query->where('family_saver_bonuses.nominee_member_id', $member->id);
            }
        }

        $rows = $query->orderBy('family_saver_bonuses.id','desc')->limit(100)->get();

        $data = [];
        $sr = 1;

        foreach ($rows as $row) {

            $data[] = [
                "sr_no" => $sr++,
                "transaction_id" => "FSB".str_pad($row->id,6,"0",STR_PAD_LEFT),
                "date" => $row->calculated_at
                    ? Carbon::parse($row->calculated_at)->format('Y-m-d')
                    : "-",
                "family_id" => $row->nominee_member_id,
                "deceased_member" => $row->deceased_member_name ?? "-",
                "combined_business" => $row->monthly_company_pv,
                "qualification_status" => $row->qualification_status,
                "earned" => $row->bonus_amount,
                "status" => $row->status,
                "wallet" => "On Hold"
            ];
        }

        return response()->json([
            "message" => "Family Saver bonus history",
            "data" => $data
        ]);
    }



    public function calculateMonthly(Request $request)
    {
        $request->validate([
            "month" => "required|date_format:Y-m"
        ]);

        $month = $request->month;

        $percentage = 1;

        $companyPv = DB::table('company_pv_records')
            ->where('month_key',$month)
            ->value('total_pv');

        if (!$companyPv) {
            return response()->json([
                "message" => "Company PV not found"
            ],404);
        }

        $totalBonus = ($companyPv * $percentage) / 100;

        $claims = DB::table('death_claims')
            ->where('verification_status','verified')
            ->where('month_key',$month)
            ->get();

        $claimCount = $claims->count();

        if ($claimCount == 0) {
            return response()->json([
                "message" => "No verified death claims for this month"
            ]);
        }

        // divide bonus among nominees
        $bonusPerNominee = $totalBonus / $claimCount;

        $inserted = 0;

        foreach ($claims as $claim) {

            DB::table('family_saver_bonuses')->insert([
                "nominee_member_id" => $claim->nominee_member_id,
                "deceased_member_id" => $claim->deceased_member_id,
                "death_claim_id" => $claim->id,
                "month_key" => $month,
                "monthly_company_pv" => $companyPv,
                "bonus_percentage" => $percentage,
                "bonus_amount" => $bonusPerNominee,
                "qualification_status" => "Qualified",
                "status" => "pending",
                "calculated_at" => now(),
                "created_at" => now(),
                "updated_at" => now()
            ]);

            $inserted++;
        }

        return response()->json([
            "message" => "Family saver bonus calculated",
            "data" => [
                "month" => $month,
                "company_pv" => $companyPv,
                "total_bonus_pool" => $totalBonus,
                "bonus_per_nominee" => $bonusPerNominee,
                "processed_claims" => $claimCount,
                "inserted_rows" => $inserted
            ]
        ]);
    }

}