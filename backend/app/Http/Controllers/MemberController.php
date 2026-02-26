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
            return response()->json(['message' => 'Sponsor not found or not active'], 422)
                ->header('Access-Control-Allow-Origin', '*');
        }

       
        $position = $validated['position'];
        $positionTaken = Member::where('parent_id', $sponsor->id)->where('position', $position)->exists();
        if ($positionTaken) {
            return response()->json(['message' => 'Selected leg already filled'], 422)
                ->header('Access-Control-Allow-Origin', '*');
        }

        $member = Member::create([
            'sponsor_id' => $sponsor->id,
            'parent_id' => $sponsor->id,
            'position' => $position,
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
            'memberId' => $member->id,
            'member' => $member,
        ], 201)->header('Access-Control-Allow-Origin', '*');
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
            return response()->json(['message' => 'Invalid credentials'], 401)
                ->header('Access-Control-Allow-Origin', '*');
        }

        return response()->json([
            'message' => 'Login successful',
            'member' => $member,
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Quick sponsor verification used by frontend AJAX
     */
    public function checkSponsor(Request $request)
    {
        $request->validate([
            'sponsorId' => 'required|string'
        ]);

        $sponsor = Member::where('user_id', $request->sponsorId)->first();
        if (!$sponsor) {
            return response()->json(['message' => 'Sponsor not found'], 404)
                ->header('Access-Control-Allow-Origin', '*');
        }

        return response()->json([
            'sponsor' => [
                'id' => $sponsor->id,
                'user_id' => $sponsor->user_id,
                'fullname' => $sponsor->fullname,
                'status' => $sponsor->status,
            ]
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Internal add by logged-in member (simple header-based auth for now)
     */
    public function internalAdd(Request $request)
    {
        $sponsorUserId = $request->header('X-Auth-Member');
        if (!$sponsorUserId) {
            return response()->json(['message' => 'Missing authenticated sponsor header'], 401)
                ->header('Access-Control-Allow-Origin', '*');
        }

        $sponsor = Member::where('user_id', $sponsorUserId)->first();
        if (!$sponsor) {
            return response()->json(['message' => 'Invalid authenticated sponsor'], 401)
                ->header('Access-Control-Allow-Origin', '*');
        }

        $validated = $request->validate([
            'position' => 'required|in:left,right',
            'fullname' => 'required|string|max:255',
            'dob' => 'nullable|date',
            'panNumber' => 'required|string|unique:members,pan_number',
            'email' => 'nullable|email|unique:members,email',
            'mobileNo' => 'required|string|unique:members,mobile_no',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string',
            'pinCode' => 'nullable|string',
            'state' => 'nullable|string',
            'city' => 'nullable|string',
            'district' => 'nullable|string',
        ]);

        // ensure placement empty
        if (Member::where('parent_id', $sponsor->id)->where('position', $validated['position'])->exists()) {
            return response()->json(['message' => 'Selected leg already filled'], 422)
                ->header('Access-Control-Allow-Origin', '*');
        }

        $member = Member::create([
            'sponsor_id' => $sponsor->id,
            'parent_id' => $sponsor->id,
            'position' => $validated['position'],
            'fullname' => $validated['fullname'],
            'dob' => $validated['dob'] ?? null,
            'pan_number' => $validated['panNumber'],
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
        ], 201)->header('Access-Control-Allow-Origin', '*');
    }
}
