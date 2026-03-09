<?php

namespace App\Http\Controllers;

use App\Models\LeadershipRankBonus;
use App\Models\LeadershipRankSetting;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LeadershipRankBonusController extends Controller
{
    private const INSERT_BATCH_SIZE = 2000;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|exists:members,user_id',
            'cycle_date' => 'nullable|date_format:Y-m-d',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = LeadershipRankBonus::query()
            ->with([
                'upline:id,user_id,fullname',
            ])
            ->orderByDesc('cycle_date')
            ->orderByDesc('id');

        if (!empty($validated['cycle_date'])) {
            $query->whereDate('cycle_date', $validated['cycle_date']);
        }

        if (!empty($validated['user_id'])) {
            $memberId = Member::query()->where('user_id', $validated['user_id'])->value('id');
            if ($memberId) {
                $query->where('upline_member_id', $memberId);
            }
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'transaction_id' => 'LRB' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'date' => optional($row->cycle_date)->toDateString(),
                'rank_name' => $row->rank_name,
                'rank_achieved_date' => optional($row->rank_achieved_date)->toDateString(),
                'business_volume' => (float) $row->matching_income,
                'earned' => (float) $row->bonus_amount,
                'status' => $row->status,
                'generation_no' => (int) $row->generation_no,
                'bonus_percentage' => (float) $row->bonus_percentage,
                'upline_user_id' => optional($row->upline)->user_id,
                'upline_name' => optional($row->upline)->fullname,
            ];
        });

        return response()->json([
            'message' => 'Leadership Rank bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }

    public function calculateCycle(Request $request)
    {
        $validated = $request->validate([
            'cycle_date' => 'required|date_format:Y-m-d',
        ]);

        $result = $this->processCycle($validated['cycle_date']);

        return response()->json([
            'message' => 'Leadership Rank bonus calculated successfully.',
            'data' => $result,
        ], 201);
    }

    public function runCycle(string $cycleDate): array
    {
        return $this->processCycle($cycleDate);
    }

    private function processCycle(string $cycleDate): array
    {
        $incomeColumn = Schema::hasColumn('pv_matchings', 'matching_income')
            ? 'matching_income'
            : 'lapsed_matching_pv';

        $settings = LeadershipRankSetting::query()
            ->where('is_active', 1)
            ->orderBy('min_step_level')
            ->get(['rank_name', 'min_step_level', 'generation_count', 'generation_percentages'])
            ->map(function ($setting) {
                return [
                    'rank_name' => (string) $setting->rank_name,
                    'min_step_level' => (int) $setting->min_step_level,
                    'generation_count' => (int) $setting->generation_count,
                    'generation_percentages' => is_array($setting->generation_percentages)
                        ? $setting->generation_percentages
                        : [],
                ];
            })
            ->values()
            ->all();

        $maxGeneration = (int) collect($settings)->max('generation_count');

        if (empty($settings) || $maxGeneration <= 0) {
            return [
                'cycle_date' => $cycleDate,
                'income_source_column' => $incomeColumn,
                'processed_matching_rows' => 0,
                'generated_rows' => 0,
                'inserted_rows' => 0,
                'total_matching_income' => 0,
                'total_bonus_amount' => 0,
                'message' => 'No active leadership rank settings found.',
            ];
        }

        $memberCache = [];

        $getMember = function (int $memberId) use (&$memberCache) {
            if ($memberId <= 0) {
                return null;
            }

            if (array_key_exists($memberId, $memberCache)) {
                return $memberCache[$memberId];
            }

            $memberCache[$memberId] = Member::query()
                ->select('id', 'sponsor_id', 'status', 'step_level', 'activation_date')
                ->where('id', $memberId)
                ->first();

            return $memberCache[$memberId];
        };

        $getApplicableSetting = function (int $stepLevel) use ($settings) {
            $selected = null;

            foreach ($settings as $setting) {
                if ($stepLevel >= (int) $setting['min_step_level']) {
                    $selected = $setting;
                }
            }

            return $selected;
        };

        $getGenerationPercentage = function (array $percentages, int $generationNo): float {
            if (array_key_exists((string) $generationNo, $percentages)) {
                return (float) $percentages[(string) $generationNo];
            }

            if (array_key_exists($generationNo, $percentages)) {
                return (float) $percentages[$generationNo];
            }

            return 0.0;
        };

        return DB::transaction(function () use (
            $cycleDate,
            $incomeColumn,
            $maxGeneration,
            $getMember,
            $getApplicableSetting,
            $getGenerationPercentage
        ) {
            $processedMatchingRows = 0;
            $generatedRows = 0;
            $insertedRows = 0;
            $totalMatchingIncome = 0.0;
            $totalBonusAmount = 0.0;
            $insertRows = [];
            $now = now();

            DB::table('pv_matchings')
                ->select('id', 'member_id', $incomeColumn)
                ->whereDate('created_at', $cycleDate)
                ->where($incomeColumn, '>', 0)
                ->orderBy('id')
                ->chunkById(self::INSERT_BATCH_SIZE, function ($matchingRows) use (
                    &$processedMatchingRows,
                    &$generatedRows,
                    &$insertedRows,
                    &$totalMatchingIncome,
                    &$totalBonusAmount,
                    &$insertRows,
                    $cycleDate,
                    $incomeColumn,
                    $maxGeneration,
                    $now,
                    $getMember,
                    $getApplicableSetting,
                    $getGenerationPercentage
                ) {
                    foreach ($matchingRows as $matchingRow) {
                        $processedMatchingRows++;

                        $matchingIncome = round((float) $matchingRow->{$incomeColumn}, 2);
                        if ($matchingIncome <= 0) {
                            continue;
                        }

                        $totalMatchingIncome += $matchingIncome;

                        $sourceMember = $getMember((int) $matchingRow->member_id);
                        if (!$sourceMember || empty($sourceMember->sponsor_id)) {
                            continue;
                        }

                        $uplineId = (int) $sourceMember->sponsor_id;
                        $generationNo = 1;

                        while ($uplineId > 0 && $generationNo <= $maxGeneration) {
                            $upline = $getMember($uplineId);
                            if (!$upline) {
                                break;
                            }

                            if ((int) $upline->status === 1) {
                                $rankSetting = $getApplicableSetting((int) $upline->step_level);

                                if ($rankSetting !== null && $generationNo <= (int) $rankSetting['generation_count']) {
                                    $bonusPercentage = $getGenerationPercentage(
                                        $rankSetting['generation_percentages'] ?? [],
                                        $generationNo
                                    );

                                    if ($bonusPercentage > 0) {
                                        $bonusAmount = round(($matchingIncome * $bonusPercentage) / 100, 2);

                                        $insertRows[] = [
                                            'upline_member_id' => (int) $upline->id,
                                            'source_member_id' => (int) $sourceMember->id,
                                            'source_pv_matching_id' => (int) $matchingRow->id,
                                            'generation_no' => $generationNo,
                                            'cycle_date' => $cycleDate,
                                            'matching_income' => $matchingIncome,
                                            'bonus_percentage' => $bonusPercentage,
                                            'bonus_amount' => $bonusAmount,
                                            'rank_name' => (string) $rankSetting['rank_name'],
                                            'rank_achieved_date' => !empty($upline->activation_date)
                                                ? date('Y-m-d', strtotime((string) $upline->activation_date))
                                                : null,
                                            'status' => 'pending',
                                            'calculated_at' => $now,
                                            'created_at' => $now,
                                            'updated_at' => $now,
                                        ];

                                        $generatedRows++;
                                        $totalBonusAmount += $bonusAmount;

                                        if (count($insertRows) >= self::INSERT_BATCH_SIZE) {
                                            $insertedRows += LeadershipRankBonus::query()->insertOrIgnore($insertRows);
                                            $insertRows = [];
                                        }
                                    }
                                }
                            }

                            $uplineId = (int) ($upline->sponsor_id ?? 0);
                            $generationNo++;
                        }
                    }
                }, 'id');

            if (!empty($insertRows)) {
                $insertedRows += LeadershipRankBonus::query()->insertOrIgnore($insertRows);
            }

            return [
                'cycle_date' => $cycleDate,
                'income_source_column' => $incomeColumn,
                'processed_matching_rows' => $processedMatchingRows,
                'generated_rows' => $generatedRows,
                'inserted_rows' => $insertedRows,
                'total_matching_income' => round($totalMatchingIncome, 2),
                'total_bonus_amount' => round($totalBonusAmount, 2),
            ];
        });
    }
}
