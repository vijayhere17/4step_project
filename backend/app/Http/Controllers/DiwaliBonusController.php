<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Member;
use App\Models\DiwaliBonus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class DiwaliBonusController extends Controller
{
    private const BONUS_PERCENTAGE = 5;
    private const ELIGIBLE_STEP_LEVEL = 4;

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ Get Diwali Bonus History
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|exists:members,user_id',
            'limit'   => 'nullable|integer|min:1|max:200',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = DiwaliBonus::query()
            ->with('member:id,user_id,fullname')
            ->orderByDesc('bonus_year')
            ->orderByDesc('id');

        if (!empty($validated['user_id'])) {
            $member = Member::where('user_id', $validated['user_id'])->first();

            if (!$member) {
                return response()->json([
                    'message' => 'Member not found',
                    'data' => [],
                ], 404);
            }

            $query->where('member_id', $member->id);
        }

        $bonuses = $query->limit($limit)->get()->map(function ($bonus) {
            return [
                'id' => $bonus->id,
                'transaction_id' => 'DB' . str_pad((string) $bonus->id, 5, '0', STR_PAD_LEFT),
                'date' => optional($bonus->calculated_at)->toDateString()
                        ?? optional($bonus->created_at)->toDateString(),
                'festival_year' => $bonus->bonus_year,
                'target_business' => (float) $bonus->total_lapsed_pv,
                'percentage' => (float) $bonus->bonus_percentage,
                'earned' => (float) $bonus->bonus_amount,
                'status' => 'Approved',
                'member_user_id' => optional($bonus->member)->user_id,
                'member_name' => optional($bonus->member)->fullname,
            ];
        })->values();

        return response()->json([
            'message' => 'Diwali bonus history fetched successfully.',
            'data' => $bonuses,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ Calculate Yearly Diwali Bonus
    |--------------------------------------------------------------------------
    */

    public function calculateYearly(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:' . (now()->year + 1),
        ]);

        $year = (int) $validated['year'];

        return DB::transaction(function () use ($year) {

            if (DiwaliBonus::where('bonus_year', $year)->exists()) {
                throw ValidationException::withMessages([
                    'year' => ["Diwali bonus already calculated for {$year}."]
                ]);
            }

            $startDate = Carbon::create($year, 10, 1)->startOfDay();
            $endDate   = Carbon::create($year, 10, 31)->endOfDay();

            $processedMembers = 0;
            $totalBonusAmount = 0;

            User::where('step_level', '>=', self::ELIGIBLE_STEP_LEVEL)
                ->orderBy('id')
                ->chunk(1000, function ($users) use (
                    $year,
                    $startDate,
                    $endDate,
                    &$processedMembers,
                    &$totalBonusAmount
                ) {

                    $insertData = [];

                    foreach ($users as $user) {

                        $totalLapsedPv = DB::table('pv_matchings')
                            ->where('member_id', $user->id)
                            ->whereBetween('created_at', [$startDate, $endDate])
                            ->sum('lapsed_matching_pv');

                        if ($totalLapsedPv <= 0) {
                            continue;
                        }

                        $bonusAmount = round(
                            ($totalLapsedPv * self::BONUS_PERCENTAGE) / 100,
                            2
                        );

                        $insertData[] = [
                            'member_id'        => $user->id,
                            'bonus_year'       => $year,
                            'period_start'     => $startDate->toDateString(),
                            'period_end'       => $endDate->toDateString(),
                            'total_lapsed_pv'  => round($totalLapsedPv, 2),
                            'bonus_percentage' => self::BONUS_PERCENTAGE,
                            'bonus_amount'     => $bonusAmount,
                            'calculated_at'    => now(),
                            'created_at'       => now(),
                            'updated_at'       => now(),
                        ];

                        $processedMembers++;
                        $totalBonusAmount += $bonusAmount;
                    }

                    if (!empty($insertData)) {
                        DiwaliBonus::insert($insertData);
                    }
                });

            return response()->json([
                'message' => 'Diwali bonus calculated successfully.',
                'data' => [
                    'year' => $year,
                    'period_start' => $startDate->toDateString(),
                    'period_end' => $endDate->toDateString(),
                    'processed_members' => $processedMembers,
                    'total_bonus_amount' => round($totalBonusAmount, 2),
                    'bonus_percentage' => self::BONUS_PERCENTAGE,
                ],
            ], 201);
        });
    }
}