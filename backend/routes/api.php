<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MemberController;

// API routes for member operations (stateless, no CSRF)
Route::post('member/signup', [MemberController::class, 'signup']);
Route::post('member/signin', [MemberController::class, 'signin']);
Route::post('member/check-sponsor', [MemberController::class, 'checkSponsor']);
Route::post('member/internal-add', [MemberController::class, 'internalAdd']);
