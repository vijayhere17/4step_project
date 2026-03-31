<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\MemberController;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::post('/products/repurchase', [AdminProductController::class, 'storeRepurchase'])->name('products.repurchase.store');
    Route::post('/products/consistency', [AdminProductController::class, 'storeConsistency'])->name('products.consistency.store');
});

// any web routes remain here; member API routes moved to routes/api.php to avoid CSRF errors
