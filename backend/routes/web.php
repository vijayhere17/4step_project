<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MemberController;

Route::get('/', function () {
    return view('welcome');
});

// any web routes remain here; member API routes moved to routes/api.php to avoid CSRF errors
