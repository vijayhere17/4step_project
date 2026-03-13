<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class IncomeSummaryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = trim((string) ($request->header('X-Auth-Member') ?: $request->query('user_id', '')));

        if ($userId === '') {
            return response()->json([
                'message' => 'Missing member identifier.',
            ], 401);
        }

        $validated = $request->validate([
            'from_date' => 'nullable|date_format:Y-m-d',
            'to_date' => 'nullable|date_format:Y-m-d|after_or_equal:from_date',
        ]);

        if (!Schema::hasTable('income_summaries')) {
            return response()->json([
                'message' => 'income_summaries table not found. Create it first.',
                'data' => [],
            ], 422);
        }

        $query = DB::table('income_summaries')
            ->where('user_id', $userId);

        if (!empty($validated['from_date'])) {
            $query->whereDate('entry_date', '>=', $validated['from_date']);
        }

        if (!empty($validated['to_date'])) {
            $query->whereDate('entry_date', '<=', $validated['to_date']);
        }

        $rows = $query
            ->orderByDesc('entry_date')
            ->orderByDesc('id')
            ->get()
            ->values()
            ->map(function ($row, $index) {
                return [
                    'sr_no' => $index + 1,
                    'date' => !empty($row->entry_date)
                        ? date('d-m-Y', strtotime((string) $row->entry_date))
                        : '-',
                    'description' => (string) ($row->description ?? ''),
                    'credit_amount' => round((float) ($row->credit_amount ?? 0), 2),
                    'debit_amount' => round((float) ($row->debit_amount ?? 0), 2),
                    'balance_amount' => round((float) ($row->balance_amount ?? 0), 2),
                ];
            });

        return response()->json([
            'message' => 'Income summary fetched successfully.',
            'data' => $rows,
        ]);
    }
}