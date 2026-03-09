<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchTurnoverBonus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchTurnoverBonusController extends Controller
{
    private const BATCH_SIZE = 2000;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'month' => 'nullable|date_format:Y-m',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $limit = (int) ($validated['limit'] ?? 100);

        $query = BranchTurnoverBonus::query()
            ->with('branch:id,name')
            ->orderByDesc('month_key')
            ->orderByDesc('id');

        if (!empty($validated['month'])) {
            $query->where('month_key', $validated['month']);
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'transaction_id' => 'BTB' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT),
                'date' => optional($row->calculated_at)->toDateString(),
                'branch_name' => optional($row->branch)->name,
                'turnover' => (float) $row->total_turnover,
                'share_percentage' => (float) $row->commission_percentage,
                'earned' => (float) $row->bonus_amount,
                'status' => $row->status,
            ];
        });

        return response()->json([
            'message' => 'Branch Turnover bonus history fetched successfully.',
            'data' => $rows,
        ]);
    }

    public function calculateMonthly(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        $result = $this->processMonth($validated['month']);

        return response()->json([
            'message' => 'Branch Turnover bonus calculated successfully.',
            'data' => $result,
        ], 201);
    }

    public function runMonth(string $month): array
    {
        return $this->processMonth($month);
    }

    private function processMonth(string $month): array
    {
        $monthStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $monthKey = $monthStart->format('Y-m');

        return DB::transaction(function () use ($monthKey, $monthStart, $monthEnd) {
            $processedBranches = 0;
            $insertedRows = 0;
            $totalTurnover = 0.0;
            $totalBonus = 0.0;
            $rows = [];
            $now = now();

            Branch::query()
                ->where('is_active', 1)
                ->select('id', 'commission_percentage')
                ->orderBy('id')
                ->chunkById(self::BATCH_SIZE, function ($branches) use (
                    &$processedBranches,
                    &$insertedRows,
                    &$totalTurnover,
                    &$totalBonus,
                    &$rows,
                    $monthKey,
                    $monthStart,
                    $monthEnd,
                    $now
                ) {
                    $branchIds = $branches->pluck('id')->all();

                    $turnoverMap = DB::table('branch_sales')
                        ->whereIn('branch_id', $branchIds)
                        ->where('status', 'approved')
                        ->whereBetween('sale_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
                        ->selectRaw('branch_id, SUM(sale_amount) as total_turnover')
                        ->groupBy('branch_id')
                        ->pluck('total_turnover', 'branch_id');

                    foreach ($branches as $branch) {
                        $processedBranches++;
                        $branchTurnover = round((float) ($turnoverMap[$branch->id] ?? 0), 2);

                        if ($branchTurnover <= 0) {
                            continue;
                        }

                        $commissionPercentage = (float) $branch->commission_percentage;
                        $bonusAmount = round(($branchTurnover * $commissionPercentage) / 100, 2);

                        $rows[] = [
                            'branch_id' => (int) $branch->id,
                            'month_key' => $monthKey,
                            'total_turnover' => $branchTurnover,
                            'commission_percentage' => $commissionPercentage,
                            'bonus_amount' => $bonusAmount,
                            'status' => 'pending',
                            'calculated_at' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];

                        $totalTurnover += $branchTurnover;
                        $totalBonus += $bonusAmount;

                        if (count($rows) >= self::BATCH_SIZE) {
                            $insertedRows += BranchTurnoverBonus::query()->insertOrIgnore($rows);
                            $rows = [];
                        }
                    }
                }, 'id');

            if (!empty($rows)) {
                $insertedRows += BranchTurnoverBonus::query()->insertOrIgnore($rows);
            }

            return [
                'month' => $monthKey,
                'processed_branches' => $processedBranches,
                'inserted_rows' => $insertedRows,
                'total_turnover' => round($totalTurnover, 2),
                'total_bonus_amount' => round($totalBonus, 2),
            ];
        });
    }
}
