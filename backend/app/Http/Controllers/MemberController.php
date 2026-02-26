<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Member;

class MemberController extends Controller
{
   

    public function signup(Request $request)
    {
        $validated = $request->validate([
            'sponsorId' => 'required|string',
            'position' => 'required|in:left,right',
            'fullname' => 'required|string|max:255',
            'dob' => 'required|date',
            'gender' => 'required|string',
            'email' => 'nullable|email|unique:members,email',
            'mobileNo' => 'required|string|max:15|unique:members,mobile_no',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string',
            'pinCode' => 'nullable|string|max:10',
            'state' => 'nullable|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
        ]);

        $sponsor = Member::where('user_id', $validated['sponsorId'])->first();

        if (!$sponsor || $sponsor->status != 1) {
            return response()->json(['message' => 'Sponsor not found or not active'], 422);
        }

        // 🔥 Find placement inside selected leg only
        $placement = $this->findSpotInLeg($sponsor->id, $validated['position']);

        if (!$placement) {
            return response()->json(['message' => 'No available position found'], 422);
        }

        $member = Member::create([
            'sponsor_id' => $sponsor->id,
            'parent_id' => $placement['parent_id'],
            'position' => $placement['position'],
            'fullname' => $validated['fullname'],
            'dob' => $validated['dob'],
            'gender' => $validated['gender'],
            'email' => $validated['email'] ?? null,
            'mobile_no' => $validated['mobileNo'],
            'password' => Hash::make($validated['password']),
            'address' => $validated['address'] ?? null,
            'pin_code' => $validated['pinCode'] ?? null,
            'state' => $validated['state'] ?? null,
            'city' => $validated['city'] ?? null,
            'district' => $validated['district'] ?? null,
            'status' => 0,
        ]);

        return response()->json([
            'message' => 'Member created successfully',
            'member' => $member,
        ], 201);
    }


    public function signin(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $id = $request->identifier;

        $member = Member::where('user_id', $id)
            ->orWhere('mobile_no', $id)
            ->orWhere('email', $id)
            ->first();

        if (!$member || !Hash::check($request->password, $member->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'member' => $member,
        ]);
    }


    public function dashboard(Request $request)
    {
        $userId = $request->header('X-Auth-Member');

        if (!$userId) {
            return response()->json(['message' => 'Missing member header'], 401);
        }

        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $leftChild = Member::where('parent_id', $member->id)
            ->where('position', 'left')
            ->first();

        $rightChild = Member::where('parent_id', $member->id)
            ->where('position', 'right')
            ->first();

        $leftCount = $leftChild ? 1 + $this->countDownline($leftChild->id) : 0;
        $rightCount = $rightChild ? 1 + $this->countDownline($rightChild->id) : 0;

        return response()->json([
            'left_members' => $leftCount,
            'right_members' => $rightCount,
            'total_team' => $leftCount + $rightCount
        ]);
    }


    private function findSpotInLeg($rootId, $leg)
    {
        // Check direct leg
        $legRoot = Member::where('parent_id', $rootId)
            ->where('position', $leg)
            ->first();

        // If direct leg empty
        if (!$legRoot) {
            return [
                'parent_id' => $rootId,
                'position' => $leg
            ];
        }

        // BFS search inside that leg
        $queue = [$legRoot->id];

        while (!empty($queue)) {
            $currentId = array_shift($queue);

            $leftChild = Member::where('parent_id', $currentId)
                ->where('position', 'left')
                ->first();

            if (!$leftChild) {
                return [
                    'parent_id' => $currentId,
                    'position' => 'left'
                ];
            }

            $rightChild = Member::where('parent_id', $currentId)
                ->where('position', 'right')
                ->first();

            if (!$rightChild) {
                return [
                    'parent_id' => $currentId,
                    'position' => 'right'
                ];
            }

            $queue[] = $leftChild->id;
            $queue[] = $rightChild->id;
        }

        return null;
    }

    private function countDownline($memberId)
    {
        $children = Member::where('parent_id', $memberId)->get();

        $count = 0;

        foreach ($children as $child) {
            $count++;
            $count += $this->countDownline($child->id);
        }

        return $count;
    }

    public function checkSponsor(Request $request)
{
    $request->validate([
        'sponsorId' => 'required|string'
    ]);

    $sponsor = Member::where('user_id', $request->sponsorId)->first();

    if (!$sponsor) {
        return response()->json(['message' => 'Sponsor not found'], 404);
    }

    return response()->json([
        'sponsor' => [
            'id' => $sponsor->id,
            'user_id' => $sponsor->user_id,
            'fullname' => $sponsor->fullname,
            'status' => $sponsor->status,
        ]
    ]);
}

   public function tree(Request $request)
{
    $userId = $request->header('X-Auth-Member');

    if (!$userId) {
        return response()->json(['message' => 'Missing member header'], 401);
    }

    $member = Member::where('user_id', $userId)->first();

    if (!$member) {
        return response()->json(['message' => 'Member not found'], 404);
    }

    return response()->json([
        'tree' => $this->buildTree($member->id, 4) // 4 levels
    ]);
}

private function buildTree($memberId, $levels)
{
    if ($levels == 0) return null;

    $member = Member::find($memberId);

    if (!$member) return null;

    $left = Member::where('parent_id', $memberId)
        ->where('position', 'left')
        ->first();

    $right = Member::where('parent_id', $memberId)
        ->where('position', 'right')
        ->first();

    return [
        'id' => $member->id,
        'user_id' => $member->user_id,
        'fullname' => $member->fullname,
        'status' => $member->status,
        'left' => $left ? $this->buildTree($left->id, $levels - 1) : null,
        'right' => $right ? $this->buildTree($right->id, $levels - 1) : null,
    ];
}
}