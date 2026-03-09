<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Member;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:500',
            'user_id' => 'nullable|string',
        ]);

        if (!Schema::hasTable('branches')) {
            return response()->json([
                'message' => 'Branches table not found.',
                'data' => [],
            ], 404);
        }

        $limit = (int) ($validated['limit'] ?? 200);

        $query = DB::table('branches')->orderByDesc('id');

        if (!empty($validated['user_id']) && Schema::hasColumn('branches', 'user_id')) {
            $query->where('user_id', $validated['user_id']);
        }

        $rows = $query
            ->limit($limit)
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $this->pickValue($row, ['id'], null),
                    'user_id' => $this->pickValue($row, ['user_id']),
                    'shopee_name' => $this->pickValue($row, ['shopee_name', 'shop_name', 'branch_name', 'name', 'title']),
                    'shopee_type' => $this->pickValue($row, ['shopee_type', 'shoppe_type', 'shop_type', 'branch_type', 'type']),
                    'date' => $this->formatDate($this->pickValue($row, ['date', 'join_date', 'registered_at', 'created_at'], null)),
                    'contact_person' => $this->pickValue($row, ['contact_person', 'owner_name', 'manager_name', 'contact_name']),
                    'state' => $this->pickValue($row, ['state']),
                    'district' => $this->pickValue($row, ['district']),
                    'city_taluka' => $this->pickValue($row, ['city_taluka', 'city', 'taluka']),
                    'status' => $this->formatStatus($this->pickValue($row, ['status', 'is_active', 'active'], null)),
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Branch list fetched successfully.',
            'data' => $rows,
        ]);
    }

    public function referralBranch(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $memberUserId = trim((string) ($request->header('X-Auth-Member') ?: ($validated['user_id'] ?? '')));

        if ($memberUserId === '') {
            return response()->json([
                'message' => 'Missing member identifier.',
                'data' => [],
            ], 422);
        }

        if (!Schema::hasTable('branches')) {
            return response()->json([
                'message' => 'Branches table not found.',
                'data' => [],
            ], 404);
        }

        $member = Member::where('user_id', $memberUserId)->first();

        if (!$member) {
            return response()->json([
                'message' => 'Member not found.',
                'data' => [],
            ], 404);
        }

        $sponsor = !empty($member->sponsor_id) ? Member::find($member->sponsor_id) : null;

        $limit = (int) ($validated['limit'] ?? 200);

        $query = DB::table('branches')->orderByDesc('id');

        $hasMemberId = Schema::hasColumn('branches', 'member_id');
        $hasUserId = Schema::hasColumn('branches', 'user_id');
        $hasSponsorId = Schema::hasColumn('branches', 'sponsor_id');
        $hasSponsorUserId = Schema::hasColumn('branches', 'sponsor_user_id');

        if (!$hasMemberId && !$hasUserId && !$hasSponsorId && !$hasSponsorUserId) {
            return response()->json([
                'message' => 'No supported member reference column found in branches table.',
                'member' => [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'fullname' => $member->fullname,
                ],
                'sponsor' => $sponsor ? [
                    'id' => $sponsor->id,
                    'user_id' => $sponsor->user_id,
                    'fullname' => $sponsor->fullname,
                ] : null,
                'data' => [],
            ], 422);
        }

        $memberIds = array_values(array_unique(array_filter([
            $member->id,
            $sponsor?->id,
        ], static fn ($value) => $value !== null && $value !== '')));

        $memberUserIds = array_values(array_unique(array_filter([
            (string) $member->user_id,
            (string) $member->id,
            $sponsor ? (string) $sponsor->user_id : null,
            $sponsor ? (string) $sponsor->id : null,
        ], static fn ($value) => $value !== null && $value !== '')));

        $query->where(function ($subQuery) use ($hasMemberId, $hasUserId, $hasSponsorId, $hasSponsorUserId, $memberIds, $memberUserIds) {
            if ($hasMemberId) {
                $subQuery->orWhereIn('member_id', $memberIds);
            }

            if ($hasSponsorId) {
                $subQuery->orWhereIn('sponsor_id', $memberIds);
            }

            if ($hasUserId) {
                $subQuery->orWhereIn('user_id', $memberUserIds);
            }

            if ($hasSponsorUserId) {
                $subQuery->orWhereIn('sponsor_user_id', $memberUserIds);
            }
        });

        $rows = $query
            ->limit($limit)
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $this->pickValue($row, ['id'], null),
                    'user_id' => $this->pickValue($row, ['user_id']),
                    'shopee_name' => $this->pickValue($row, ['shopee_name', 'shop_name', 'branch_name', 'name', 'title']),
                    'shopee_type' => $this->pickValue($row, ['shopee_type', 'shoppe_type', 'shop_type', 'branch_type', 'type']),
                    'date' => $this->formatDate($this->pickValue($row, ['date', 'join_date', 'registered_at', 'created_at'], null)),
                    'contact_person' => $this->pickValue($row, ['contact_person', 'owner_name', 'manager_name', 'contact_name']),
                    'state' => $this->pickValue($row, ['state']),
                    'district' => $this->pickValue($row, ['district']),
                    'city_taluka' => $this->pickValue($row, ['city_taluka', 'city', 'taluka']),
                    'status' => $this->formatStatus($this->pickValue($row, ['status', 'is_active', 'active'], null)),
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Referral branch list fetched successfully.',
            'member' => [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'fullname' => $member->fullname,
            ],
            'sponsor' => $sponsor ? [
                'id' => $sponsor->id,
                'user_id' => $sponsor->user_id,
                'fullname' => $sponsor->fullname,
            ] : null,
            'data' => $rows,
        ]);
    }

    private function pickValue(object $row, array $keys, $default = '--')
    {
        foreach ($keys as $key) {
            if (property_exists($row, $key) && $row->{$key} !== null && $row->{$key} !== '') {
                return $row->{$key};
            }
        }

        return $default;
    }

    private function formatDate($value): string
    {
        if (empty($value) || $value === '--') {
            return '--';
        }

        try {
            return \Carbon\Carbon::parse($value)->format('d-m-Y');
        } catch (\Throwable $e) {
            return '--';
        }
    }

    private function formatStatus($value): string
    {
        if ($value === null || $value === '--') {
            return '--';
        }

        if (is_numeric($value)) {
            return (int) $value === 1 ? 'Active' : 'Inactive';
        }

        $normalized = strtolower(trim((string) $value));

        if (in_array($normalized, ['1', 'true', 'active', 'approved', 'enabled'], true)) {
            return 'Active';
        }

        if (in_array($normalized, ['0', 'false', 'inactive', 'disabled', 'pending'], true)) {
            return 'Inactive';
        }

        return ucfirst($normalized);
    }
}
