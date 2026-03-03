<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MemberController;

// API routes for member operations (stateless, no CSRF)
Route::post('member/signup', [MemberController::class, 'signup']);
Route::post('member/signin', [MemberController::class, 'signin']);
Route::post('member/check-sponsor', [MemberController::class, 'checkSponsor']);
Route::post('member/internal-add', [MemberController::class, 'internalAdd']);
Route::get('/member/dashboard', [MemberController::class, 'dashboard']);
Route::get('/member/tree', [MemberController::class, 'tree']);
Route::get('member/profile', [MemberController::class, 'profile']);
Route::put('member/profile', [MemberController::class, 'updateProfile']);
Route::get('member/kyc', [MemberController::class, 'getKyc']);
Route::put('member/kyc', [MemberController::class, 'upsertKyc']);
Route::get('member/id-card', [MemberController::class, 'getIdCard']);
Route::post('member/id-card', [MemberController::class, 'uploadIdCard']);
Route::post('member/check-sponsor', [MemberController::class, 'checkSponsor']);
Route::post('member/internal-add', [MemberController::class, 'internalAdd']);
Route::get('/downline', [MemberController::class, 'getDownline']);
Route::get('/matching-status', [MemberController::class, 'matchingStatus']);
