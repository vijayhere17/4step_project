<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class RankRewardController extends Controller
{

    private const REWARD_TIERS = [
        ['rank'=>'Rising Star','target'=>5000,'days'=>30,'image'=>'/rewards/image 5 .png'],
        ['rank'=>'Bronze','target'=>10000,'days'=>60,'image'=>'/rewards/image 6.png'],
        ['rank'=>'Silver','target'=>20000,'days'=>90,'image'=>'/rewards/image 7.png'],
        ['rank'=>'Gold','target'=>45000,'days'=>120,'image'=>'/rewards/image 8.png'],
        ['rank'=>'Platinum','target'=>100000,'days'=>150,'image'=>'/rewards/image 9.png'],
        ['rank'=>'Ruby','target'=>500000,'days'=>180,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Sapphire','target'=>1100000,'days'=>210,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Emerald','target'=>2500000,'days'=>240,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Diamond','target'=>5100000,'days'=>270,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Black Diamond','target'=>10000000,'days'=>300,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Royal Diamond','target'=>30000000,'days'=>330,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Crown Diamond','target'=>50000000,'days'=>360,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Jewel','target'=>100000000,'days'=>390,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Crown Jewel','target'=>250000000,'days'=>420,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Ambassador','target'=>1000000000,'days'=>450,'image'=>'/rewards/image 10.png'],
        ['rank'=>'Emperor','target'=>5000000000,'days'=>480,'image'=>'/rewards/image 10.png'],
    ];

    public function rankRewards(Request $request)
    {

        $userId = trim((string) ($request->header('X-Auth-Member') ?: $request->query('user_id','')));

        if($userId === ''){
            return response()->json(['message'=>'Missing member identifier'],401);
        }

        $member = Member::where('user_id',$userId)->first();

        if(!$member){
            return response()->json(['message'=>'Member not found'],404);
        }

        $achievedAmount = $this->resolveAchievedAmount($member,$userId);

        $rewards = $this->buildRewardRows($achievedAmount,$member);

        $summary = $this->buildSummary($rewards,$achievedAmount);

        return response()->json([
            'data'=>[
                'summary'=>$summary,
                'rewards'=>$rewards
            ],
            'total_target'=>$summary['total_target'],
            'total_achieved'=>$summary['total_achieved'],
            'ranks_achieved'=>$summary['ranks_achieved'],
            'total_ranks'=>$summary['total_ranks'],
            'rewards'=>$rewards
        ]);

    }

    private function resolveAchievedAmount(Member $member,string $userId): float
    {

        if(!Schema::hasTable('wallets')){
            return 0;
        }

        $wallet = DB::table('wallets')
            ->where('user_id',$member->id)
            ->first();

        if(!$wallet){
            return 0;
        }

        $totalIncome = $wallet->total_income ?? 0;

        if($totalIncome > 0){
            return round($totalIncome,2);
        }

        $matchingIncome = $wallet->matching_income ?? 0;
        $royaltyIncome = $wallet->royalty_income ?? 0;

        return round($matchingIncome + $royaltyIncome,2);

    }


    private function buildRewardRows(float $achievedAmount, Member $member): array
    {

        $rows = [];

        $joinDate = Carbon::parse($member->created_at);

        foreach(self::REWARD_TIERS as $index=>$tier){

            $target = (float)$tier['target'];
            $days = (int)$tier['days'];

            $deadline = $joinDate->copy()->addDays($days);

            $pending = max(0,$target - $achievedAmount);

            $progress = $target>0
                ? min(100,round(($achievedAmount/$target)*100,2))
                : 0;

            $rows[] = [
                'id'=>$index+1,
                'rank'=>$tier['rank'],
                'target'=>$target,
                'achieved'=>min($achievedAmount,$target),
                'pending'=>$pending,
                'progress'=>$progress,
                'days_limit'=>$days,
                'deadline'=>$deadline->toDateString(),
                'image'=>$tier['image'],
                'status'=>$pending<=0 ? 'Achieved' : 'Pending'
            ];

        }

        return $rows;

    }


    private function buildSummary(array $rewards,float $achievedAmount): array
    {

        $ranksAchieved = collect($rewards)
            ->where('status','Achieved')
            ->count();

        return [
            'total_target'=>array_sum(array_column(self::REWARD_TIERS,'target')),
            'total_achieved'=>round($achievedAmount,2),
            'ranks_achieved'=>$ranksAchieved,
            'total_ranks'=>count(self::REWARD_TIERS)
        ];

    }

}