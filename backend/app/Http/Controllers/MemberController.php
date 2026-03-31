<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Member;
use App\Models\MyKyc;
use App\Models\IdCard;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class MemberController extends Controller
{
    private const CONSISTENCY_TX_PREFIX = 'CONSISTENCY_TX:';

   
    private const PACKAGES = [
        ['id' => 'step-1', 'step' => 1, 'label' => '1 Step', 'pv' => 125,  'amount_min' => 1199,  'amount_max' => 1500,  'cycle_capping' => 500,  'daily_capping' => 1000],
        ['id' => 'step-2', 'step' => 2, 'label' => '2 Step', 'pv' => 250,  'amount_min' => 1999,  'amount_max' => 2500,  'cycle_capping' => 1000,  'daily_capping' => 2000],
        ['id' => 'step-3', 'step' => 3, 'label' => '3 Step', 'pv' => 500,  'amount_min' => 2999,  'amount_max' => 3500,  'cycle_capping' => 2000,  'daily_capping' => 4000],
        ['id' => 'step-4', 'step' => 4, 'label' => '4 Step', 'pv' => 1000, 'amount_min' => 3999,  'amount_max' => 4500,  'cycle_capping' => 5000,  'daily_capping' => 10000],
        ['id' => 'step-5', 'step' => 5, 'label' => '5 Step', 'pv' => 2000, 'amount_min' => 5999,  'amount_max' => 7500,  'cycle_capping' => 10000,  'daily_capping' => 20000],
        ['id' => 'step-6', 'step' => 6, 'label' => '6 Step', 'pv' => 4000, 'amount_min' => 11599, 'amount_max' => 15000, 'cycle_capping' => 20000, 'daily_capping' => 40000],
    ];
    public function signup(Request $request)
    {
        $data = $request->validate([
            'sponsorId' => 'required|string',
            'position'  => 'required|in:left,right',
            'fullname'  => 'required|string|max:255',
            'dob'       => 'required|date',
            'gender'    => 'required|string',
            'email'     => 'nullable|email|unique:members,email',
            'mobileNo'  => 'required|string|max:15|unique:members,mobile_no',
            'password'  => 'required|string|min:6',
            'address'   => 'nullable|string',
            'pinCode'   => 'nullable|string|max:10',
            'state'     => 'nullable|string',
            'city'      => 'nullable|string',
            'district'  => 'nullable|string',
        ]);

        $sponsor = Member::where('user_id', $data['sponsorId'])->first();

        if (!$sponsor || $sponsor->status != 1) {
            return response()->json(['message' => 'Sponsor not found or not active'], 422);
        }

        $slot = $this->findSpotInLeg($sponsor->id, $data['position']);

        if (!$slot) {
            return response()->json(['message' => 'No available position found'], 422);
        }

        $member = Member::create([
            'sponsor_id' => $sponsor->id,
            'parent_id'  => $slot['parent_id'],
            'position'   => $slot['position'],
            'fullname'   => $data['fullname'],
            'dob'        => $data['dob'],
            'gender'     => $data['gender'],
            'email'      => $data['email'] ?? null,
            'mobile_no'  => $data['mobileNo'],
            'password'   => Hash::make($data['password']),
            'address'    => $data['address'] ?? null,
            'pin_code'   => $data['pinCode'] ?? null,
            'state'      => $data['state'] ?? null,
            'city'       => $data['city'] ?? null,
            'district'   => $data['district'] ?? null,
            'status'     => 0, 
        ]);

        return response()->json(['message' => 'Member created successfully', 'member' => $member], 201);
    }
    public function internalAdd(Request $request)
    {
        $data = $request->validate([
            'sponsorId' => 'required|string',
            'position'  => 'required|in:left,right',
            'fullname'  => 'required|string|max:255',
            'dob'       => 'nullable|date',
            'gender'    => 'nullable|string',
            'email'     => 'nullable|email|unique:members,email',
            'mobileNo'  => 'required|string|max:15|unique:members,mobile_no',
            'address'   => 'nullable|string',
            'pinCode'   => 'nullable|string|max:10',
            'state'     => 'nullable|string',
            'city'      => 'nullable|string',
            'district'  => 'nullable|string',
        ]);

        $sponsor = Member::where('user_id', $data['sponsorId'])->first();

        if (!$sponsor) {
            return response()->json(['message' => 'Sponsor not found'], 422);
        }

        $slot = $this->findSpotInLeg($sponsor->id, $data['position']);

        if (!$slot) {
            return response()->json(['message' => 'No available position found'], 422);
        }

        $member = Member::create([
            'sponsor_id' => $sponsor->id,
            'parent_id'  => $slot['parent_id'],
            'position'   => $slot['position'],
            'fullname'   => $data['fullname'],
            'dob'        => $data['dob'] ?? null,
            'gender'     => $data['gender'] ?? null,
            'email'      => $data['email'] ?? null,
            'mobile_no'  => $data['mobileNo'],
            'password'   => Hash::make($data['mobileNo']), 
            'address'    => $data['address'] ?? null,
            'pin_code'   => $data['pinCode'] ?? null,
            'state'      => $data['state'] ?? null,
            'city'       => $data['city'] ?? null,
            'district'   => $data['district'] ?? null,
            'status'     => 0,
        ]);

        return response()->json(['message' => 'Member added successfully', 'member' => $member], 201);
    }

    public function signin(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password'   => 'required|string',
        ]);

        $id = $request->identifier;

        $member = Member::where('user_id', $id)
            ->orWhere('mobile_no', $id)
            ->orWhere('email', $id)
            ->first();

        if (!$member || !Hash::check($request->password, $member->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json(['message' => 'Login successful', 'member' => $member]);
    }
    public function profile(Request $request)
    {
        $request->validate(['user_id' => 'required|string']);

        $member = $this->findMemberByUserId($request->user_id);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        return response()->json($member);
    }
    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'user_id'   => 'required|string|exists:members,user_id',
            'fullname'  => 'nullable|string|max:255',
            'dob'       => 'nullable|date',
            'gender'    => 'nullable|string',
            'email'     => 'nullable|email',
            'mobile_no' => 'nullable|string',
            'address'   => 'nullable|string',
            'pin_code'  => 'nullable|string',
            'state'     => 'nullable|string',
            'city'      => 'nullable|string',
            'district'  => 'nullable|string',
            'shipping_address'  => 'nullable|string',
            'shipping_pin_code' => 'nullable|string',
            'shipping_state'    => 'nullable|string',
            'shipping_city'     => 'nullable|string',
            'shipping_district' => 'nullable|string',
            'nominee_name'      => 'nullable|string|max:255',
            'nominee_relation'  => 'nullable|string|max:120',
            'nominee_mobile_no' => 'nullable|string|max:20',
            'nominee_address'   => 'nullable|string',
            'nominee_state'     => 'nullable|string|max:120',
            'nominee_city'      => 'nullable|string|max:120',
            'nominee_district'  => 'nullable|string|max:120',
            'nominee_pin_code'  => 'nullable|string|max:20',
        ]);

        $member = $this->findMemberByUserId($data['user_id']);

        $updateData = $data;
        unset($updateData['user_id']);

        $shippingFields = [
            'shipping_address',
            'shipping_pin_code',
            'shipping_state',
            'shipping_city',
            'shipping_district',
            'nominee_name',
            'nominee_relation',
            'nominee_mobile_no',
            'nominee_address',
            'nominee_state',
            'nominee_city',
            'nominee_district',
            'nominee_pin_code',
        ];

        foreach ($shippingFields as $field) {
            if (!Schema::hasColumn('members', $field)) {
                unset($updateData[$field]);
            }
        }

        $member->update($updateData);

        return response()->json(['message' => 'Profile updated successfully', 'member' => $member]);
    }
    public function dashboard(Request $request)
    {
        $member = $this->getMemberFromHeader($request);

        if (!$member) {
            return response()->json(['message' => 'Member not found or missing header'], 401);
        }
        $leftChild  = Member::where('parent_id', $member->id)->where('position', 'left')->first();
        $rightChild = Member::where('parent_id', $member->id)->where('position', 'right')->first();

        $leftCount  = $leftChild  ? 1 + $this->countDownline($leftChild->id)  : 0;
        $rightCount = $rightChild ? 1 + $this->countDownline($rightChild->id) : 0;

        return response()->json([
            'left_members'          => $leftCount,
            'right_members'         => $rightCount,
            'total_team'            => $leftCount + $rightCount,
            'packages'              => self::PACKAGES,
            'selected_package_id'   => $this->resolveMemberPackageId($member),
            'selected_package_step' => $this->resolveMemberPackageStep($member),
            'package_step'          => (int) ($member->package_step ?? 0),
            'step_level'            => (int) ($member->step_level ?? 0),
            'status'                => (int) ($member->status ?? 0),
        ]);
    }
    public function dashboardStats(Request $request)
    {
        $member = $this->getMemberFromHeader($request);

        if (!$member) {
            return response()->json(['message' => 'Member not found or missing header'], 401);
        }

        $memberId   = (int) $member->id;
        $userId     = (string) $request->header('X-Auth-Member');
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd   = now()->endOfMonth()->toDateString();
        $monthKey   = now()->format('Y-m');

        $leftChild  = Member::where('parent_id', $memberId)->where('position', 'left')->first();
        $rightChild = Member::where('parent_id', $memberId)->where('position', 'right')->first();

        $leftTeamCount  = $leftChild ? 1 + $this->countDownline($leftChild->id) : 0;
        $rightTeamCount = $rightChild ? 1 + $this->countDownline($rightChild->id) : 0;
        $totalTeam      = $leftTeamCount + $rightTeamCount;

        $leftActiveCount  = $leftChild ? $this->countActiveDownline($leftChild->id) : 0;
        $rightActiveCount = $rightChild ? $this->countActiveDownline($rightChild->id) : 0;
        $totalActiveTeam  = $leftActiveCount + $rightActiveCount;

        $salesData = $this->getSalesData($memberId, $userId, $monthStart, $monthEnd);
        $leadershipRank = $this->getLeadershipRank($memberId, $userId);

        return response()->json([
            'data' => [
            // New dashboard 11-card fields
            'total_team'          => $totalTeam,
            'total_active_team'   => $totalActiveTeam,
            'total_manager_left'  => $leftTeamCount,
            'total_manager_right' => $rightTeamCount,
            'id_position_step'    => $this->resolveMemberPackageStep($member),
            'leadership_rank'     => $leadershipRank,
            'rank_with_reward'    => $this->getRankWithReward($memberId, $userId),
            'repurchase_balance'  => $this->getPurchaseBalance($memberId, $userId),
            'consistency_balance' => $this->getConsistencyBalance($memberId, $userId),
            'earning_balance'     => $this->getEarningBalance($memberId, $userId),
            'direct_id'           => $this->getDirectIdCount($memberId),
            'direct_branch'       => $this->getDirectBranchCount($memberId),

            // Legacy fields kept for compatibility
                'purchase_balance'  => $this->getPurchaseBalance($memberId, $userId),
                'turnover_balance'  => $this->getTurnoverBalance($memberId, $userId),
                'purchase_orders'   => $this->getPurchaseOrders($memberId, $userId, $monthStart, $monthEnd),
                'sales_orders'      => $salesData['count'],
                'sales_turnover'    => $salesData['turnover'],
                'commission_amount' => $this->getCommissionAmount($memberId, $userId, $monthStart, $monthEnd, $monthKey),
            ],
        ]);
    }
    public function activatePackage(Request $request)
    {
        $data = $request->validate([
            'package_id' => 'required|string',
            'user_id'    => 'nullable|string',
        ]);

        $userId = $request->header('X-Auth-Member') ?: ($data['user_id'] ?? null);

        if (!$userId) {
            return response()->json(['message' => 'Missing member identifier'], 401);
        }

        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $package = $this->findPackageById(trim($data['package_id']));

        if (!$package) {
            return response()->json(['message' => 'Invalid package selected'], 422);
        }

        $now = now();
        $isCurrentlyActive = (int) ($member->status ?? 0) === 1;
        $currentStep = $this->resolveMemberPackageStep($member);
        $targetStep = (int) ($package['step'] ?? 0);

        if (!$isCurrentlyActive) {
            $registrationDate = Carbon::parse($member->created_at);
            $activationDeadline = $registrationDate->copy()->addDays(30);

            if ($now->greaterThan($activationDeadline)) {
                return response()->json([
                    'message' => 'Activation deadline exceeded (30 days from registration)',
                    'activation_deadline' => $activationDeadline->toDateString(),
                ], 422);
            }
        }

        if ($isCurrentlyActive && $targetStep > $currentStep) {
            if (empty($member->activation_date)) {
                return response()->json([
                    'message' => 'Activation date missing; cannot validate upgrade window',
                ], 422);
            }

            $upgradeDeadline = Carbon::parse($member->activation_date)->addDays(180);
            if ($now->greaterThan($upgradeDeadline)) {
                return response()->json([
                    'message' => 'Upgrade window expired (180 days from activation)',
                    'upgrade_deadline' => $upgradeDeadline->toDateString(),
                ], 422);
            }
        }

        $updateData = [
            'status'          => 1,
        ];

        if (!$isCurrentlyActive) {
            $updateData['activation_date'] = $now;
        }

        if (Schema::hasColumn('members', 'package_step')) {
            $updateData['package_step'] = (int) $package['step'];
        }

        if (Schema::hasColumn('members', 'step_level')) {
            $updateData['step_level'] = (int) $package['step'];
        }

        if (Schema::hasColumn('members', 'activation_amount')) {
            $updateData['activation_amount'] = (int) $package['amount_min'];
        }

        Member::where('id', $member->id)->update($updateData);
        $member->refresh();

        return response()->json([
            'message' => 'Package activated successfully',
            'member'  => [
                'user_id'             => $member->user_id,
                'status'              => (int) $member->status,
                'activation_date'     => $member->activation_date,
                'selected_package_id' => $data['package_id'],
            ],
        ]);
    }
    public function checkSponsor(Request $request)
    {
        $request->validate(['sponsorId' => 'required|string']);

        $sponsor = Member::where('user_id', $request->sponsorId)->first();

        if (!$sponsor) {
            return response()->json(['message' => 'Sponsor not found'], 404);
        }

        return response()->json([
            'sponsor' => [
                'id'       => $sponsor->id,
                'user_id'  => $sponsor->user_id,
                'fullname' => $sponsor->fullname,
                'status'   => $sponsor->status,
            ],
        ]);
    }
    public function tree(Request $request)
    {
        $member = $this->getMemberFromHeader($request);

        if (!$member) {
            return response()->json(['message' => 'Member not found or missing header'], 401);
        }

        return response()->json(['tree' => $this->buildTree($member->id, 4)]);
    }

    public function getDownline(Request $request)
    {
        $userId = $request->header('X-Auth-Member') ?: $request->query('user_id');

        if (!$userId) {
            return response()->json(['message' => 'Missing member identifier'], 401);
        }

        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        return response()->json([
            'left'  => $this->getAllDownline($member->id, 'left',  []),
            'right' => $this->getAllDownline($member->id, 'right', []),
        ]);
    }
    public function getKyc(Request $request)
    {
        $request->validate(['user_id' => 'required|string']);

        $member = $this->findMemberByUserId($request->user_id);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        return response()->json(MyKyc::where('member_id', $member->id)->first());
    }
    public function upsertKyc(Request $request)
    {
        $data = $request->validate([
            'user_id'                  => 'required|string',
            'account_beneficiary_name' => 'required|string',
            'account_no'               => 'required|string',
            're_account_no'            => 'required|string',
            'ifs_code'                 => 'required|string',
            'bank_name'                => 'required|string',
            'branch_name'              => 'required|string',
            'aadhar_number'            => 'required|string',
            'pan_number'               => 'required|string',
        ]);

        if ($data['account_no'] !== $data['re_account_no']) {
            return response()->json(['message' => 'Account numbers do not match'], 422);
        }

        $member = $this->findMemberByUserId($data['user_id']);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $existing = MyKyc::where('member_id', $member->id)->first();

        $kyc = MyKyc::updateOrCreate(
            ['member_id' => $member->id],
            [
                'user_id'                  => $member->user_id,
                'account_beneficiary_name' => $existing ? $existing->account_beneficiary_name : $data['account_beneficiary_name'],
                'account_no'               => $existing ? $existing->account_no               : $data['account_no'],
                'ifs_code'                 => $existing ? $existing->ifs_code                 : strtoupper($data['ifs_code']),
                'bank_name'                => $existing ? $existing->bank_name                : $data['bank_name'],
                'branch_name'              => $existing ? $existing->branch_name              : $data['branch_name'],
                'aadhar_number'            => $existing ? $existing->aadhar_number            : $data['aadhar_number'],
                'pan_number'               => $existing ? $existing->pan_number               : strtoupper($data['pan_number']),
                'otp_verified'             => true,
            ]
        );

        return response()->json(['message' => 'KYC updated successfully', 'kyc' => $kyc]);
    }
    public function getIdCard(Request $request)
    {
        $request->validate(['user_id' => 'required|string']);

        $member = $this->findMemberByUserId($request->user_id);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $idCard = IdCard::where('member_id', $member->id)->first();

        if (!$idCard) {
            return response()->json(['message' => 'ID card photo not found'], 404);
        }

        return response()->json([
            'id_card'   => $idCard,
            'photo_url' => Storage::url($idCard->file_path),
        ]);
    }
    public function uploadIdCard(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|string',
            'photo'   => 'required|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        $member = $this->findMemberByUserId($data['user_id']);

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $existing = IdCard::where('member_id', $member->id)->first();

        if ($existing && $existing->file_path && Storage::disk('public')->exists($existing->file_path)) {
            Storage::disk('public')->delete($existing->file_path);
        }

        $photo      = $request->file('photo');
        $storedPath = $photo->store('id_cards', 'public');

        $idCard = IdCard::updateOrCreate(
            ['member_id' => $member->id],
            [
                'user_id'       => $member->user_id,
                'file_path'     => $storedPath,
                'original_name' => $photo->getClientOriginalName(),
                'mime_type'     => $photo->getClientMimeType(),
                'file_size'     => $photo->getSize(),
            ]
        );

        return response()->json([
            'message'   => 'ID card photo uploaded successfully',
            'id_card'   => $idCard,
            'photo_url' => Storage::url($idCard->file_path),
        ]);
    }
    public function matchingStatus(Request $request)
    {
        $userId = 1; // TODO: replace with authenticated member ID

        $history = \App\Models\MatchingHistory::where('user_id', $userId)
            ->orderBy('match_date', 'desc')
            ->get();

        return response()->json($history);
    }
    private function findMemberByUserId(string $userId): ?Member
    {
        return Member::where('user_id', $userId)->first();
    }
    private function getMemberFromHeader(Request $request): ?Member
    {
        $userId = $request->header('X-Auth-Member');

        if (!$userId) {
            return null;
        }

        return Member::where('user_id', $userId)->first();
    }

    private function resolveMemberPackageStep(Member $member): int
    {
        $step = (int) ($member->package_step ?? $member->step_level ?? 0);

        return max(0, min(6, $step));
    }
    private function resolveMemberPackageId(Member $member): ?string
    {
        $step = $this->resolveMemberPackageStep($member);

        return $step > 0 ? 'step-' . $step : null;
    }
    private function findPackageById(string $packageId): ?array
    {
        foreach (self::PACKAGES as $package) {
            if ($package['id'] === $packageId) {
                return $package;
            }
        }

        return null;
    }
    private function findSpotInLeg(int $rootId, string $leg): ?array
    {
        $directChild = Member::where('parent_id', $rootId)->where('position', $leg)->first();

        if (!$directChild) {
            return ['parent_id' => $rootId, 'position' => $leg];
        }
        $queue = [$directChild->id];

        while (!empty($queue)) {
            $currentId = array_shift($queue);

            $left  = Member::where('parent_id', $currentId)->where('position', 'left')->first();
            $right = Member::where('parent_id', $currentId)->where('position', 'right')->first();

            if (!$left)  return ['parent_id' => $currentId, 'position' => 'left'];
            if (!$right) return ['parent_id' => $currentId, 'position' => 'right'];

            $queue[] = $left->id;
            $queue[] = $right->id;
        }

        return null; // no open slot found
    }
    private function countDownline(int $memberId): int
    {
        $count = 0;

        foreach (Member::where('parent_id', $memberId)->get() as $child) {
            $count++;
            $count += $this->countDownline($child->id);
        }

        return $count;
    }
    private function buildTree(int $memberId, int $levels): ?array
    {
        if ($levels === 0) return null;

        $member = Member::find($memberId);

        if (!$member) return null;

        $left  = Member::where('parent_id', $memberId)->where('position', 'left')->first();
        $right = Member::where('parent_id', $memberId)->where('position', 'right')->first();

        return [
            'id'       => $member->id,
            'user_id'  => $member->user_id,
            'fullname' => $member->fullname,
            'status'   => $member->status,
            'left'     => $left  ? $this->buildTree($left->id,  $levels - 1) : null,
            'right'    => $right ? $this->buildTree($right->id, $levels - 1) : null,
        ];
    }
    private function getAllDownline(int $parentId, string $position, array $visited): \Illuminate\Support\Collection
    {
        if (in_array($parentId, $visited)) {
            return collect();
        }

        $visited[] = $parentId;
        $all       = collect();

        foreach (Member::where('parent_id', $parentId)->where('position', $position)->get() as $member) {
            $all->push($member);
            $all = $all->merge($this->getAllDownline($member->id, 'left',  $visited));
            $all = $all->merge($this->getAllDownline($member->id, 'right', $visited));
        }

        return $all;
    }
    private function getPurchaseBalance(int $memberId, string $userId): float
    {
        $table = 'repurchase_wallet_transactions';

        if (!Schema::hasTable($table)) {
            return 0.0;
        }

        [$idCol, $identifier] = $this->rwTableIdColumn($table, $memberId, $userId);

        $query = DB::table($table)
            ->where($idCol, $identifier)
            ->where(function ($innerQuery) {
                $innerQuery->whereNull('description')
                    ->orWhere(function ($textQuery) {
                        $textQuery->where('description', 'not like', self::CONSISTENCY_TX_PREFIX . '%')
                            ->where('description', 'not like', '%(Consistency wallet)%');
                    });
            });

        if (Schema::hasColumn($table, 'balance_after')) {
            $latest = (clone $query)->orderByDesc('id')->value('balance_after');

            if ($latest !== null) {
                return round((float) $latest, 2);
            }
        }

        if (Schema::hasColumn($table, 'amount') && Schema::hasColumn($table, 'type')) {
            $debitTypes = ['debit', 'dr', 'deduct', 'withdrawal', 'withdraw', 'purchase'];

            $credits = (float) (clone $query)->whereNotIn('type', $debitTypes)->sum('amount');
            $debits  = (float) (clone $query)->whereIn('type', $debitTypes)->sum('amount');

            return round($credits - $debits, 2);
        }

        return 0.0;
    }
    private function getTurnoverBalance(int $memberId, string $userId): float
    {
        if (!Schema::hasTable('wallets')) {
            return 0.0;
        }

        $query = DB::table('wallets');

        if (Schema::hasColumn('wallets', 'user_id')) {
            $query->where(function ($q) use ($memberId, $userId) {
                $q->where('user_id', $memberId)
                  ->orWhere('user_id', (string) $memberId)
                  ->orWhere('user_id', $userId);
            });
        } elseif (Schema::hasColumn('wallets', 'member_id')) {
            $query->where('member_id', $memberId);
        }

        $wallet = $query->first();

        if (!$wallet) {
            return 0.0;
        }

        $totalIncome    = property_exists($wallet, 'total_income')    ? (float) $wallet->total_income    : 0.0;
        $matchingIncome = property_exists($wallet, 'matching_income') ? (float) $wallet->matching_income : 0.0;
        $royaltyIncome  = property_exists($wallet, 'royalty_income')  ? (float) $wallet->royalty_income  : 0.0;

        return $totalIncome > 0
            ? round($totalIncome, 2)
            : round($matchingIncome + $royaltyIncome, 2);
    }
    private function getPurchaseOrders(int $memberId, string $userId, string $monthStart, string $monthEnd): int
    {
        $table = 'repurchase_wallet_transactions';

        if (!Schema::hasTable($table)) {
            return 0;
        }

        [$idCol, $identifier] = $this->rwTableIdColumn($table, $memberId, $userId);

        $query = DB::table($table)->where($idCol, $identifier);

        if (Schema::hasColumn($table, 'created_at')) {
            $query->whereDate('created_at', '>=', $monthStart)
                  ->whereDate('created_at', '<=', $monthEnd);
        }

        return (int) $query->count();
    }

    private function getSalesData(int $memberId, string $userId, string $monthStart, string $monthEnd): array
    {
        if (!Schema::hasTable('branch_sales')) {
            return ['count' => 0, 'turnover' => 0.0];
        }

        $query = DB::table('branch_sales');

        if (Schema::hasColumn('branch_sales', 'sale_date')) {
            $query->whereDate('sale_date', '>=', $monthStart)
                  ->whereDate('sale_date', '<=', $monthEnd);
        }

        if (Schema::hasColumn('branch_sales', 'member_id')) {
            $query->where('member_id', $memberId);
        } elseif (Schema::hasColumn('branch_sales', 'user_id')) {
            $query->where('user_id', $userId);
        }

        $turnover = Schema::hasColumn('branch_sales', 'sale_amount')
            ? round((float) (clone $query)->sum('sale_amount'), 2)
            : 0.0;

        return ['count' => (int) $query->count(), 'turnover' => $turnover];
    }

    private function getCommissionAmount(int $memberId, string $userId, string $monthStart, string $monthEnd, string $monthKey): float
    {
        $total = 0.0;
        if (Schema::hasTable('loyalty_bonuses') && Schema::hasColumn('loyalty_bonuses', 'bonus_amount')) {
            $q = DB::table('loyalty_bonuses');
            $this->applyMemberFilter($q, 'loyalty_bonuses', $memberId, $userId);

            if (Schema::hasColumn('loyalty_bonuses', 'month_key')) {
                $q->where('month_key', $monthKey);
            }

            $total += (float) $q->sum('bonus_amount');
        }
        if (Schema::hasTable('business_monitoring_bonuses') && Schema::hasColumn('business_monitoring_bonuses', 'bonus_amount')) {
            $q = DB::table('business_monitoring_bonuses');
            $this->applyMemberFilter($q, 'business_monitoring_bonuses', $memberId, $userId);

            if (Schema::hasColumn('business_monitoring_bonuses', 'cycle_date')) {
                $q->whereDate('cycle_date', '>=', $monthStart)
                  ->whereDate('cycle_date', '<=', $monthEnd);
            }

            $total += (float) $q->sum('bonus_amount');
        }

        return round($total, 2);
    }
    private function countActiveDownline(int $memberId): int
    {
        $count = 0;
        $children = Member::where('parent_id', $memberId)->get();

        foreach ($children as $child) {
            if ((int) $child->status === 1) {
                $count++;
            }

            $count += $this->countActiveDownline($child->id);
        }

        return $count;
    }
    private function getLeadershipRank(int $memberId, string $userId): string
    {
        if (!Schema::hasTable('leadership_rank_bonuses')) {
            return 'N/A';
        }

        $query = DB::table('leadership_rank_bonuses');

        if (Schema::hasColumn('leadership_rank_bonuses', 'upline_member_id')) {
            $query->where('upline_member_id', $memberId);
        } elseif (Schema::hasColumn('leadership_rank_bonuses', 'member_id')) {
            $query->where('member_id', $memberId);
        } elseif (Schema::hasColumn('leadership_rank_bonuses', 'user_id')) {
            $query->where('user_id', $userId);
        }

        if (Schema::hasColumn('leadership_rank_bonuses', 'rank_achieved_date')) {
            $query->orderByDesc('rank_achieved_date');
        }

        $rank = $query->orderByDesc('id')->value('rank_name');

        return $rank ? (string) $rank : 'N/A';
    }
    private function getRankWithReward(int $memberId, string $userId): string
    {
        $total = $this->getEarningBalance($memberId, $userId);

        $tiers = [
            ['rank' => 'Rising Star', 'target' => 5000],
            ['rank' => 'Bronze', 'target' => 10000],
            ['rank' => 'Silver', 'target' => 20000],
            ['rank' => 'Gold', 'target' => 45000],
            ['rank' => 'Platinum', 'target' => 100000],
            ['rank' => 'Ruby', 'target' => 500000],
            ['rank' => 'Sapphire', 'target' => 1100000],
            ['rank' => 'Emerald', 'target' => 2500000],
            ['rank' => 'Diamond', 'target' => 5100000],
        ];

        $achieved = 'N/A';

        foreach ($tiers as $tier) {
            if ($total >= $tier['target']) {
                $achieved = $tier['rank'];
            }
        }

        return $achieved;
    }
    private function getConsistencyBalance(int $memberId, string $userId): float
    {
        $bonusCredits = 0.0;

        if (Schema::hasTable('loyalty_bonuses') && Schema::hasColumn('loyalty_bonuses', 'bonus_amount')) {
            $query = DB::table('loyalty_bonuses');
            $this->applyMemberFilter($query, 'loyalty_bonuses', $memberId, $userId);

            if (Schema::hasColumn('loyalty_bonuses', 'type')) {
                $query->where('type', 'consistency');
            }

            $bonusCredits = (float) $query->sum('bonus_amount');
        }

        $table = 'repurchase_wallet_transactions';
        if (!Schema::hasTable($table)) {
            return round($bonusCredits, 2);
        }

        [$idCol, $identifier] = $this->rwTableIdColumn($table, $memberId, $userId);
        $txQuery = DB::table($table)
            ->where($idCol, $identifier)
            ->where(function ($innerQuery) {
                $innerQuery->where('description', 'like', self::CONSISTENCY_TX_PREFIX . '%')
                    ->orWhere('description', 'like', '%(Consistency wallet)%');
            });

        $credits = 0.0;
        $debits = 0.0;

        if (Schema::hasColumn($table, 'amount') && Schema::hasColumn($table, 'type')) {
            $credits = (float) (clone $txQuery)->where('type', 'credit')->sum('amount');
            $debits = (float) (clone $txQuery)->where('type', 'debit')->sum('amount');
        }

        return round($bonusCredits + $credits - $debits, 2);
    }
    private function getEarningBalance(int $memberId, string $userId): float
    {
        $turnover = $this->getTurnoverBalance($memberId, $userId);

        if ($turnover > 0) {
            return $turnover;
        }

        return round(
            $this->getConsistencyBalance($memberId, $userId) + $this->getPurchaseBalance($memberId, $userId),
            2
        );
    }
    private function getDirectIdCount(int $memberId): int
    {
        return (int) Member::where('sponsor_id', $memberId)->count();
    }
    private function getDirectBranchCount(int $memberId): int
    {
        return (int) Member::where('sponsor_id', $memberId)
            ->whereNotNull('position')
            ->distinct('position')
            ->count('position');
    }
    private function rwTableIdColumn(string $table, int $memberId, string $userId): array
    {
        if (Schema::hasColumn($table, 'user_id')) {
            $columnType = Schema::getColumnType($table, 'user_id');
            $numericTypes = ['bigint', 'integer', 'int', 'mediumint', 'smallint', 'tinyint', 'decimal', 'float'];

            return in_array(strtolower($columnType), $numericTypes, true)
                ? ['user_id', $memberId]
                : ['user_id', $userId];
        }

        return ['member_id', $memberId];
    }
    private function applyMemberFilter(\Illuminate\Database\Query\Builder $query, string $table, int $memberId, string $userId): void
    {
        if (Schema::hasColumn($table, 'member_id')) {
            $query->where('member_id', $memberId);
        } elseif (Schema::hasColumn($table, 'user_id')) {
            $query->where('user_id', $userId);
        }
    }
}
