<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EarningBalanceController extends Controller
{

   
    public function withdrawal(Request $request)
    {
        $user_id = $request->header('X-Auth-Member');

        if (!$user_id) {
            return response()->json([
                "message" => "User ID missing"
            ],401);
        }

        $rows = DB::table('earning_balance_withdrawals')
            ->where('user_id',$user_id)
            ->orderBy('id','desc')
            ->get();

        $data = [];
        $sr = 1;

        foreach ($rows as $row) {

            $data[] = [
                "sr_no" => $sr++,
                "payment_date" => $row->payment_date 
                    ? date('d-m-Y',strtotime($row->payment_date))
                    : "-",
                "payment_amount" => $row->payment_amount ?? 0,
                "reference_no" => $row->reference_no ?? "",
                "status" => $row->status ?? "Pending"
            ];
        }

        return response()->json([
            "message" => "Withdrawal history",
            "data" => $data
        ]);
    }


 
    public function history(Request $request)
    {
        $user_id = $request->header('X-Auth-Member');

        if (!$user_id) {
            return response()->json([
                "message" => "User ID missing"
            ],401);
        }

        $rows = DB::table('earning_balance_histories')
            ->where('user_id',$user_id)
            ->orderBy('id','desc')
            ->get();

        $data = [];
        $sr = 1;

        foreach ($rows as $row) {

            $data[] = [
                "sr_no" => $sr++,
                "date" => $row->entry_date
                    ? date('d-m-Y',strtotime($row->entry_date))
                    : "-",
                "description" => $row->description ?? "",
                "credit_amount" => $row->credit_amount ?? 0,
                "debit_amount" => $row->debit_amount ?? 0,
                "balance_amount" => $row->balance_amount ?? 0,
                "status" => $row->status ?? "Pending"
            ];
        }

        return response()->json([
            "message" => "Earning balance history",
            "data" => $data
        ]);
    }

}