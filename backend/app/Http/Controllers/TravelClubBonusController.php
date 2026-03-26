<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TravelClubBonusController extends Controller
{
    // Dynamic travel-club bonus view/controller for member travel incentive records.
    private const TARGETS = [
        'single_domestic' => 600000,
        'couple_domestic' => 1000000,
        'single_international' => 1100000,
        'couple_international' => 2000000,
    ];

    public function index(Request $request)
    {

        $userId = $request->header('X-Auth-Member');

        if (!$userId) {
            return response()->json([
                'message' => 'Missing member identifier'
            ], 401);
        }

        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return response()->json([
                'message' => 'Member not found'
            ], 404);
        }

        // get wallet
        $wallet = DB::table('wallets')
            ->where('user_id', $member->id)
            ->first();

        $gbBonus = $wallet->gb_bonus ?? 0;
        $prBonus = $wallet->pr_bonus ?? 0;

        $totalBonus = $gbBonus + $prBonus;

        // milestones
        $milestones = [
            [
                'key' => 'single_domestic',
                'label' => 'Single Domestic',
                'reward' => 'Domestic Trip',
                'trip_type' => 'Single',
                'duration' => '2N / 3D',
                'target' => self::TARGETS['single_domestic'],
            ],
            [
                'key' => 'couple_domestic',
                'label' => 'Couple Domestic',
                'reward' => 'Domestic Trip',
                'trip_type' => 'Couple',
                'duration' => '2N / 3D',
                'target' => self::TARGETS['couple_domestic'],
            ],
            [
                'key' => 'single_international',
                'label' => 'Single International',
                'reward' => 'International Trip',
                'trip_type' => 'Single',
                'duration' => '3N / 4D',
                'target' => self::TARGETS['single_international'],
            ],
            [
                'key' => 'couple_international',
                'label' => 'Couple International',
                'reward' => 'International Trip',
                'trip_type' => 'Couple',
                'duration' => '3N / 4D',
                'target' => self::TARGETS['couple_international'],
            ],
        ];

        $reward = "Not Qualified";
        $tripType = "-";
        $duration = "-";

        foreach ($milestones as $i => $m) {

            $target = $m['target'];

            $achieved = min($totalBonus, $target);
            $pending = max(0, $target - $totalBonus);
            $progress = ($totalBonus / $target) * 100;

            $milestones[$i]['achieved'] = $achieved;
            $milestones[$i]['pending'] = $pending;
            $milestones[$i]['progress'] = round($progress, 2);
            $milestones[$i]['status'] = $pending <= 0 ? "Achieved" : "Pending";

            if ($totalBonus >= $target) {
                $reward = $m['reward'];
                $tripType = $m['trip_type'];
                $duration = $m['duration'];
            }
        }

        // next target
        $nextTarget = null;

        foreach ($milestones as $m) {
            if ($m['pending'] > 0) {
                $nextTarget = $m;
                break;
            }
        }

        $overallProgress = ($totalBonus / self::TARGETS['couple_international']) * 100;

        return response()->json([
            'message' => 'Travel club status fetched',
            'data' => [
                'gb_bonus' => $gbBonus,
                'pr_bonus' => $prBonus,
                'total_bonus' => $totalBonus,
                'reward' => $reward,
                'trip_type' => $tripType,
                'duration' => $duration,
                'overall_progress' => round($overallProgress, 2),
                'next_target' => $nextTarget,
                'targets' => self::TARGETS,
                'milestones' => $milestones
            ]
        ]);
    }
}