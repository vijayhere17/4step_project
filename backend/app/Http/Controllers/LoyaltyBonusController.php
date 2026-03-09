<?php

namespace App\Http\Controllers;

use App\Models\RoyaltySetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class LoyaltyBonusController extends Controller
{
    private const CHUNK_SIZE = 1000;
    private const DEFAULT_MIN_MONTHLY_PURCHASE = 500.00;
    private const DEFAULT_MONTHLY_PERCENTAGE = 20.0;
    private const DEFAULT_CONSISTENCY_PERCENTAGE = 25.0;

    public function index(Request $request): JsonResponse
    {
        if (!Schema::hasTable('loyalty_bonuses')) {
            return response()->json([
                'message' => 'Loyalty bonus table not found. Please run migration or import SQL.',
                'data' => [],
            ]);
        }

        $validated = $request->validate([
            'user_id' => 'nullable|string|exists:members,user_id',
            'month' => 'nullable|date_format:Y-m',
            'type' => 'nullable|in:monthly,consistency',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = DB::table('loyalty_bonuses as lb')
            ->join('members as m', 'm.id', '=', 'lb.member_id')
            ->select(
                'lb.id',
                'lb.month_key',
                'lb.purchase_amount',
                'lb.bonus_percentage',
                'lb.bonus_amount',
                'lb.type',
                'lb.status',
                'lb.calculated_at',
                'm.user_id as member_user_id',
                'm.fullname as member_name'
            )
            ->orderByDesc('lb.month_key')
            ->orderByDesc('lb.id');

        if (!empty($validated['month'])) {
            $query->where('lb.month_key', $validated['month']);
        }

        if (!empty($validated['type'])) {
            $query->where('lb.type', $validated['type']);
        }

        if (!empty($validated['user_id'])) {
            $query->where('m.user_id', $validated['user_id']);
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            $dateValue = !empty($row->calculated_at)
                ? Carbon::parse($row->calculated_at)->toDateString()
                : null;

            return [
                'id' => (int) $row->id,
                'date' => $dateValue,
                'transaction_id' => 'LB' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'invoice_no' => 'INV' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'repurchase_amount' => (float) $row->purchase_amount,
                'percentage' => (float) $row->bonus_percentage,
                'earned' => (float) $row->bonus_amount,
                'type' => (string) $row->type,
                'status' => ucfirst((string) $row->status),
                'member_user_id' => (string) $row->member_user_id,
                'member_name' => (string) $row->member_name,
            ];
        });

        return response()->json([
            'message' => 'Loyalty bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }


    public function calculateMonthly(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        try {
            $monthStart = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        } catch (\Throwable $exception) {
            throw ValidationException::withMessages([
                'month' => ['Invalid month format. Use Y-m (example: 2026-03).'],
            ]);
        }

        $monthEnd = $monthStart->copy()->endOfMonth();
        $monthKey = $monthStart->format('Y-m');

        $minMonthlyPurchase = $this->getConfiguredPercentage(
            'loyalty_min_monthly_purchase',
            self::DEFAULT_MIN_MONTHLY_PURCHASE
        );

        $monthlyBonusPercentage = $this->getConfiguredPercentage(
            'loyalty_monthly_bonus_percentage',
            self::DEFAULT_MONTHLY_PERCENTAGE
        );

        $result = DB::transaction(function () use (
            $monthKey,
            $monthStart,
            $monthEnd,
            $minMonthlyPurchase,
            $monthlyBonusPercentage
        ) {
            $processedMembers = 0;
            $eligibleMembers = 0;
            $rowsToUpsert = [];
            $upsertedRows = 0;
            $totalBonusAmount = 0.0;
            $now = now();

            DB::table('members')
                ->select('id')
                ->where('status', 1)
                ->orderBy('id')
                ->chunkById(self::CHUNK_SIZE, function ($membersChunk) use (
                    &$processedMembers,
                    &$eligibleMembers,
                    &$rowsToUpsert,
                    &$upsertedRows,
                    &$totalBonusAmount,
                    $monthKey,
                    $monthStart,
                    $monthEnd,
                    $minMonthlyPurchase,
                    $monthlyBonusPercentage,
                    $now
                ) {
                    $memberIds = $membersChunk->pluck('id')->map(fn ($id) => (int) $id)->all();
                    $processedMembers += count($memberIds);

                    if (empty($memberIds)) {
                        return;
                    }

                    $purchasesByMember = DB::table('purchases')
                        ->select('member_id', DB::raw('SUM(amount) as monthly_purchase'))
                        ->whereIn('member_id', $memberIds)
                        ->whereDate('purchase_date', '>=', $monthStart->toDateString())
                        ->whereDate('purchase_date', '<=', $monthEnd->toDateString())
                        ->groupBy('member_id')
                        ->havingRaw('SUM(amount) >= ?', [$minMonthlyPurchase])
                        ->get();

                    foreach ($purchasesByMember as $row) {
                        $purchaseAmount = round((float) $row->monthly_purchase, 2);
                        $bonusAmount = round(($purchaseAmount * $monthlyBonusPercentage) / 100, 2);

                        $eligibleMembers++;
                        $totalBonusAmount += $bonusAmount;

                        $rowsToUpsert[] = [
                            'member_id' => (int) $row->member_id,
                            'month_key' => $monthKey,
                            'purchase_amount' => $purchaseAmount,
                            'bonus_percentage' => $monthlyBonusPercentage,
                            'bonus_amount' => $bonusAmount,
                            'type' => 'monthly',
                            'status' => 'pending',
                            'calculated_at' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    if (!empty($rowsToUpsert)) {
                        DB::table('loyalty_bonuses')->upsert(
                            $rowsToUpsert,
                            ['member_id', 'month_key', 'type'],
                            ['purchase_amount', 'bonus_percentage', 'bonus_amount', 'status', 'calculated_at', 'updated_at']
                        );

                        $upsertedRows += count($rowsToUpsert);
                        $rowsToUpsert = [];
                    }
                }, 'id');

            return [
                'month' => $monthKey,
                'minimum_monthly_purchase' => (float) $minMonthlyPurchase,
                'monthly_bonus_percentage' => (float) $monthlyBonusPercentage,
                'processed_members' => $processedMembers,
                'eligible_members' => $eligibleMembers,
                'upserted_rows' => $upsertedRows,
                'total_bonus_amount' => round($totalBonusAmount, 2),
            ];
        });

        return response()->json([
            'message' => 'Monthly loyalty bonus calculated successfully.',
            'data' => $result,
        ], 201);
    }


    public function calculateConsistencyBonus(): JsonResponse
    {
        $currentMonthStart = now()->startOfMonth();
        $currentMonthKey = $currentMonthStart->format('Y-m');

        $minMonthlyPurchase = $this->getConfiguredPercentage(
            'loyalty_min_monthly_purchase',
            self::DEFAULT_MIN_MONTHLY_PURCHASE
        );

        $consistencyBonusPercentage = $this->getConfiguredPercentage(
            'loyalty_consistency_bonus_percentage',
            self::DEFAULT_CONSISTENCY_PERCENTAGE
        );

        $result = DB::transaction(function () use (
            $currentMonthStart,
            $currentMonthKey,
            $minMonthlyPurchase,
            $consistencyBonusPercentage
        ) {
            $monthsToCheck = [];
            for ($offset = 1; $offset <= 4; $offset++) {
                $month = $currentMonthStart->copy()->subMonths($offset);
                $monthsToCheck[$month->format('Y-m')] = [
                    'start' => $month->copy()->startOfMonth()->toDateString(),
                    'end' => $month->copy()->endOfMonth()->toDateString(),
                ];
            }

            $processedMembers = 0;
            $qualifiedMembers = 0;
            $rowsToUpsert = [];
            $upsertedRows = 0;
            $totalBonusAmount = 0.0;
            $now = now();

            DB::table('members')
                ->select('id')
                ->where('status', 1)
                ->orderBy('id')
                ->chunkById(self::CHUNK_SIZE, function ($membersChunk) use (
                    &$processedMembers,
                    &$qualifiedMembers,
                    &$rowsToUpsert,
                    &$upsertedRows,
                    &$totalBonusAmount,
                    $monthsToCheck,
                    $currentMonthKey,
                    $minMonthlyPurchase,
                    $consistencyBonusPercentage,
                    $now
                ) {
                    $memberIds = $membersChunk->pluck('id')->map(fn ($id) => (int) $id)->all();
                    $processedMembers += count($memberIds);

                    if (empty($memberIds)) {
                        return;
                    }

                    $minDate = collect($monthsToCheck)->min('start');
                    $maxDate = collect($monthsToCheck)->max('end');

                    $purchaseRows = DB::table('purchases')
                        ->select(
                            'member_id',
                            DB::raw("DATE_FORMAT(purchase_date, '%Y-%m') as month_key"),
                            DB::raw('SUM(amount) as monthly_purchase')
                        )
                        ->whereIn('member_id', $memberIds)
                        ->whereDate('purchase_date', '>=', $minDate)
                        ->whereDate('purchase_date', '<=', $maxDate)
                        ->groupBy('member_id', DB::raw("DATE_FORMAT(purchase_date, '%Y-%m')"))
                        ->get();

                    $memberMonthTotals = [];
                    foreach ($purchaseRows as $row) {
                        $memberMonthTotals[(int) $row->member_id][$row->month_key] = (float) $row->monthly_purchase;
                    }

                    foreach ($memberIds as $memberId) {
                        $isQualified = true;
                        $fourMonthTotal = 0.0;

                        foreach (array_keys($monthsToCheck) as $monthKey) {
                            $monthPurchase = (float) ($memberMonthTotals[$memberId][$monthKey] ?? 0);

                            if ($monthPurchase < $minMonthlyPurchase) {
                                $isQualified = false;
                                break;
                            }

                            $fourMonthTotal += $monthPurchase;
                        }

                        if (!$isQualified) {
                            continue;
                        }

                        $bonusAmount = round(($fourMonthTotal * $consistencyBonusPercentage) / 100, 2);
                        $qualifiedMembers++;
                        $totalBonusAmount += $bonusAmount;

                        $rowsToUpsert[] = [
                            'member_id' => $memberId,
                            'month_key' => $currentMonthKey,
                            'purchase_amount' => round($fourMonthTotal, 2),
                            'bonus_percentage' => $consistencyBonusPercentage,
                            'bonus_amount' => $bonusAmount,
                            'type' => 'consistency',
                            'status' => 'pending',
                            'calculated_at' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    if (!empty($rowsToUpsert)) {
                        DB::table('loyalty_bonuses')->upsert(
                            $rowsToUpsert,
                            ['member_id', 'month_key', 'type'],
                            ['purchase_amount', 'bonus_percentage', 'bonus_amount', 'status', 'calculated_at', 'updated_at']
                        );

                        $upsertedRows += count($rowsToUpsert);
                        $rowsToUpsert = [];
                    }
                }, 'id');

            return [
                'month' => $currentMonthKey,
                'minimum_monthly_purchase' => (float) $minMonthlyPurchase,
                'consistency_bonus_percentage' => (float) $consistencyBonusPercentage,
                'processed_members' => $processedMembers,
                'qualified_members' => $qualifiedMembers,
                'upserted_rows' => $upsertedRows,
                'total_bonus_amount' => round($totalBonusAmount, 2),
                'consecutive_months_checked' => array_values(array_keys($monthsToCheck)),
            ];
        });

        return response()->json([
            'message' => 'Consistency loyalty bonus calculated successfully.',
            'data' => $result,
        ], 201);
    }

   
    private function getConfiguredPercentage(string $key, float $default): float
    {
        try {
            if (!Schema::hasTable('royalty_settings')) {
                return $default;
            }

            $value = RoyaltySetting::getDecimalValue($key, $default);
            return $value > 0 ? (float) $value : $default;
        } catch (\Throwable $exception) {
            return $default;
        }
    }
}
