<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Memberecom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MemberControllerecom extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'firstName' => 'required',
            'lastName' => 'required',
            'dob' => 'required|date',
            'gender' => 'required',
            'email' => 'required|email|unique:ecom_members,email',
            'mobileNo' => 'required|digits:10|unique:ecom_members,mobile_no',
            'address' => 'required',
            'pinCode' => 'required|digits:6',
            'state' => 'required',
            'city' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $member = Memberecom::create([
            'member_id' => '4STEP' . rand(100000, 999999),
            'fullname' => $request->firstName . ' ' . $request->lastName,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'email' => $request->email,
            'mobile_no' => $request->mobileNo,
            'address' => $request->address,
            'pin_code' => $request->pinCode,
            'state' => $request->state,
            'city' => $request->city,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Signup successful',
            'data' => $member
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'mobile_no' => 'required',
            'password' => 'required'
        ]);

        $member = Memberecom::where('mobile_no', $request->mobile_no)->first();

        if (!$member || !Hash::check($request->password, $member->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'data' => $member
        ]);
    }

    public function update(Request $request, $id)
    {
        $member = Memberecom::findOrFail($id);

        $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'dob' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'email' => [
                'required',
                'email',
                Rule::unique('ecom_members', 'email')->ignore($member->id)
            ],
            'mobileNo' => [
                'required',
                'digits:10',
                Rule::unique('ecom_members', 'mobile_no')->ignore($member->id)
            ],
            'address' => 'required|string',
            'pinCode' => 'required|digits:6',
            'state' => 'required|string',
            'city' => 'required|string',
        ]);

        $member->update([
            'fullname' => $request->firstName . ' ' . $request->lastName,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'email' => $request->email,
            'mobile_no' => $request->mobileNo,
            'address' => $request->address,
            'pin_code' => $request->pinCode,
            'state' => $request->state,
            'city' => $request->city,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $member
        ], 200);
    }
}