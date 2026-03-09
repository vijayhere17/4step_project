<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RepurchaseWalletStatusController extends Controller
{
    private const DEFAULT_LIMIT = 200;
    private const MAX_LIMIT = 500;
    private const REPURCHASE_CREDIT_PERCENTAGE = 3.0;

    private const DEBIT_TYPES = [
        'debit',
        'dr',
        'deduct',
        'deduction',
        'withdraw',
        'withdrawal',
        'purchase',
    ];

    public function index(Request $request): JsonResponse
    {
        $userId = trim((string) ($request->header('X-Auth-Member') ?: $request->query('user_id', '')));
        $statusType = strtolower(trim((string) $request->query('status_type', $this->resolveStatusType($request))));

        if ($userId === '') {
            return response()->json([
                'message' => 'Missing member identifier.',
            ], 401);
        }

        $limit = (int) $request->query('limit', self::DEFAULT_LIMIT);
        $limit = max(1, min($limit, self::MAX_LIMIT));

        $table = 'repurchase_wallet_transactions';
        $memberId = Member::query()->where('user_id', $userId)->value('id');
        $rows = collect();

        if (Schema::hasTable($table)) {
            $query = DB::table($table);

            if (Schema::hasColumn($table, 'user_id')) {
                $query->where('user_id', $userId);
            } elseif (Schema::hasColumn($table, 'member_id') && $memberId) {
                $query->where('member_id', (int) $memberId);
            }

            if (Schema::hasColumn($table, 'created_at')) {
                $query->orderByDesc('created_at');
            } else {
                $query->orderByDesc('id');
            }

            $rows = $query->limit($limit)->get();
        }

        $transactions = $rows->map(function ($row) {
            $amount = round((float) ($row->amount ?? 0), 2);
            $normalizedType = strtolower(trim((string) ($row->type ?? 'credit')));
            $isDebit = in_array($normalizedType, self::DEBIT_TYPES, true);
            $balanceAfter = property_exists($row, 'balance_after')
                ? (is_null($row->balance_after) ? null : (float) $row->balance_after)
                : null;

            return [
                'id' => (int) ($row->id ?? 0),
                'date' => $this->resolveDate($row),
                'description' => !empty($row->description)
                    ? (string) $row->description
                    : ($isDebit
                        ? 'Amount deducted from repurchase wallet'
                        : 'Repurchase wallet credit'),
                'type' => $isDebit ? 'debit' : 'credit',
                'credit_amount' => $isDebit ? 0.0 : $amount,
                'debit_amount' => $isDebit ? $amount : 0.0,
                'balance_after' => $balanceAfter,
            ];
        })->values();

        $totalCredit = round((float) $transactions->sum('credit_amount'), 2);
        $totalDebit = round((float) $transactions->sum('debit_amount'), 2);

        $totalEarning = $this->resolveTotalEarning($userId, $memberId ? (int) $memberId : null);

        if ($statusType === 'repurchase') {
            $targetCredit = round(($totalEarning * self::REPURCHASE_CREDIT_PERCENTAGE) / 100, 2);

            if ($targetCredit > $totalCredit) {
                $transactions = $transactions->prepend([
                    'id' => 'repurchase-credit-3pct',
                    'date' => now()->toDateString(),
                    'description' => sprintf(
                        '3%% of total earning credited to repurchase wallet (%.2f%%)',
                        self::REPURCHASE_CREDIT_PERCENTAGE
                    ),
                    'type' => 'credit',
                    'credit_amount' => round($targetCredit - $totalCredit, 2),
                    'debit_amount' => 0.0,
                    'balance_after' => null,
                ])->values();
            }

            $totalCredit = $targetCredit;
        }

        $latestBalance = null;
        foreach ($transactions as $transaction) {
            if ($transaction['balance_after'] !== null) {
                $latestBalance = round((float) $transaction['balance_after'], 2);
                break;
            }
        }

        return response()->json([
            'message' => 'Repurchase wallet status fetched successfully.',
            'data' => [
                'current_balance' => $latestBalance ?? round($totalCredit - $totalDebit, 2),
                'total_credit' => $totalCredit,
                'total_debit' => $totalDebit,
                'total_earning' => $totalEarning,
                'credit_percentage' => self::REPURCHASE_CREDIT_PERCENTAGE,
                'status_type' => $statusType,
                'transactions' => $transactions,
            ],
        ]);
    }

    private function resolveStatusType(Request $request): string
    {
        $path = strtolower((string) $request->path());

        if (str_contains($path, 'repurchase-status')) {
            return 'repurchase';
        }

        if (str_contains($path, 'consistency-status')) {
            return 'consistency';
        }

        return 'repurchase';
    }

    private function resolveTotalEarning(string $publicUserId, ?int $memberId): float
    {
        $walletTable = 'wallets';

        if (Schema::hasTable($walletTable)) {
            $walletQuery = DB::table($walletTable);

            if (Schema::hasColumn($walletTable, 'user_id')) {
                if ($memberId !== null) {
                    $walletQuery->where('user_id', $memberId);
                } else {
                    $walletQuery->where('user_id', $publicUserId);
                }
            } elseif (Schema::hasColumn($walletTable, 'member_id') && $memberId !== null) {
                $walletQuery->where('member_id', $memberId);
            }

            if (Schema::hasColumn($walletTable, 'total_income')) {
                $walletTotalIncome = $walletQuery->value('total_income');

                if ($walletTotalIncome !== null) {
                    return round((float) $walletTotalIncome, 2);
                }
            }

            $matchingIncome = Schema::hasColumn($walletTable, 'matching_income')
                ? (float) ($walletQuery->value('matching_income') ?? 0)
                : 0;

            $royaltyIncome = Schema::hasColumn($walletTable, 'royalty_income')
                ? (float) ($walletQuery->value('royalty_income') ?? 0)
                : 0;

            if ($matchingIncome > 0 || $royaltyIncome > 0) {
                return round($matchingIncome + $royaltyIncome, 2);
            }
        }

        $matchingHistoryTable = 'matching_histories';
        if (
            $memberId !== null &&
            Schema::hasTable($matchingHistoryTable) &&
            Schema::hasColumn($matchingHistoryTable, 'user_id') &&
            Schema::hasColumn($matchingHistoryTable, 'income_generated')
        ) {
            $historyIncome = DB::table($matchingHistoryTable)
                ->where('user_id', $memberId)
                ->sum('income_generated');

            return round((float) $historyIncome, 2);
        }

        return 0.0;
    }

    private function resolveDate(object $row): ?string
    {
        foreach (['created_at', 'transaction_date', 'date', 'txn_date'] as $column) {
            if (!property_exists($row, $column) || empty($row->{$column})) {
                continue;
            }

            try {
                return Carbon::parse((string) $row->{$column})->toDateString();
            } catch (\Throwable $exception) {
                continue;
            }
        }

        return null;
    }

    private function emptyPayload(): array
    {
        return [
            'current_balance' => 0.0,
            'total_credit' => 0.0,
            'total_debit' => 0.0,
            'total_earning' => 0.0,
            'credit_percentage' => self::REPURCHASE_CREDIT_PERCENTAGE,
            'status_type' => 'repurchase',
            'transactions' => [],
        ];
    }
}
