<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RepurchaseWalletStatusController extends Controller
{

const CREDIT_PERCENTAGE = 3;

public function index(Request $request)
{

    $userId = $request->header('X-Auth-Member');

    if(!$userId){
        return response()->json(['message'=>'User id missing'],401);
    }
    $member = Member::where('user_id',$userId)->first();

    if(!$member){
        return response()->json(['message'=>'Member not found'],404);
    }

    $rows = DB::table('repurchase_wallet_transactions')
        ->where('user_id',$userId)
        ->orderByDesc('id')
        ->limit(200)
        ->get();

    $transactions = [];
    $totalCredit = 0;
    $totalDebit = 0;

    foreach($rows as $row){

        $amount = $row->amount ?? 0;

        $type = strtolower($row->type ?? 'credit');

        if($type == 'debit'){
            $credit = 0;
            $debit = $amount;
            $totalDebit += $amount;
        }else{
            $credit = $amount;
            $debit = 0;
            $totalCredit += $amount;
        }

        $transactions[] = [
            'id'=>$row->id,
            'date'=>$row->created_at ?? null,
            'description'=>$row->description ?? '',
            'type'=>$type,
            'credit_amount'=>$credit,
            'debit_amount'=>$debit,
            'balance_after'=>$row->balance_after ?? null
        ];
    }

    $wallet = DB::table('wallets')
        ->where('user_id',$member->id)
        ->first();

    $totalEarning = $wallet->total_income ?? 0;

    $targetCredit = ($totalEarning * self::CREDIT_PERCENTAGE) / 100;

    if($targetCredit > $totalCredit){

        $extra = $targetCredit - $totalCredit;

        array_unshift($transactions,[
            'id'=>'auto-credit',
            'date'=>now()->toDateString(),
            'description'=>'3% income credited to repurchase wallet',
            'type'=>'credit',
            'credit_amount'=>$extra,
            'debit_amount'=>0,
            'balance_after'=>null
        ]);

        $totalCredit = $targetCredit;
    }

    $balance = $totalCredit - $totalDebit;

    return response()->json([
        'message'=>'Repurchase wallet status fetched',
        'data'=>[
            'current_balance'=>round($balance,2),
            'total_credit'=>round($totalCredit,2),
            'total_debit'=>round($totalDebit,2),
            'total_earning'=>round($totalEarning,2),
            'credit_percentage'=>self::CREDIT_PERCENTAGE,
            'transactions'=>$transactions
        ]
    ]);

}

}