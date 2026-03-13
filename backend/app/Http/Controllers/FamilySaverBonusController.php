<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FamilySaverBonusController extends Controller
{

    
    public function index(Request $request)
    {
        $user_id = $request->user_id;
        $month = $request->month;

        $query = DB::table('family_saver_bonuses');

        if ($month) {
            $query->where('month_key', $month);
        }

        if ($user_id) {
            $member = Member::where('user_id', $user_id)->first();

            if ($member) {
                $query->where('nominee_member_id', $member->id);
            }
        }

        $rows = $query->orderBy('id','desc')->limit(100)->get();

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
                "combined_business" => $row->monthly_company_pv,
                "qualification_status" => $row->qualification_status,
                "earned" => $row->bonus_amount,
                "status" => $row->status
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

        $percentage = 1; // 1% bonus

        $companyPv = DB::table('company_pv_records')
            ->where('month_key',$month)
            ->value('total_pv');

        if (!$companyPv) {
            return response()->json([
                "message" => "Company PV not found"
            ]);
        }

        $bonus = ($companyPv * $percentage) / 100;

        $claims = DB::table('death_claims')
            ->where('verification_status','verified')
            ->get();

        $inserted = 0;

        foreach ($claims as $claim) {

            DB::table('family_saver_bonuses')->insert([
                "nominee_member_id" => $claim->nominee_member_id,
                "deceased_member_id" => $claim->deceased_member_id,
                "death_claim_id" => $claim->id,
                "month_key" => $month,
                "monthly_company_pv" => $companyPv,
                "bonus_percentage" => $percentage,
                "bonus_amount" => $bonus,
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
                "bonus_percentage" => $percentage,
                "per_nominee_bonus" => $bonus,
                "processed_claims" => count($claims),
                "inserted_rows" => $inserted
            ]
        ]);
    }
}