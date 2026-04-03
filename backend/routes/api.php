<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\DiwaliBonusController;
use App\Http\Controllers\RoyaltyClubBonusController;
use App\Http\Controllers\BusinessMonitoringBonusController;
use App\Http\Controllers\LeadershipRankBonusController;
use App\Http\Controllers\FamilySaverBonusController;
use App\Http\Controllers\BranchTurnoverBonusController;
use App\Http\Controllers\LoyaltyBonusController;
use App\Http\Controllers\GroupBuiltupBonusController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\MemberMessageController;
use App\Http\Controllers\RepurchaseWalletStatusController;
use App\Http\Controllers\IncomeSummaryController;
use App\Http\Controllers\EarningBalanceController;
use App\Http\Controllers\RankRewardController;
use App\Http\Controllers\TravelClubBonusController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\IncomeReportController;


use App\Http\Controllers\api\MemberControllerecom;
use App\Http\Controllers\api\ProductController;
use App\Http\Controllers\api\OrderController;

// API routes for  ecommerce member operations (stateless, no CSRF)
Route::get('/orders/{member_id}', [OrderController::class, 'userOrders']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/place-order', [OrderController::class, 'store']);

Route::get('/products/category/{id}', [ProductController::class, 'productsByCategory']);
Route::get('/product/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/viral-products', [ProductController::class, 'viralProducts']);
Route::get('/products', [ProductController::class, 'allProducts']);

Route::post('/login', [MemberControllerecom::class, 'login']);
Route::post('/signup', [MemberControllerecom::class, 'store']);
Route::put('/members/{id}', [MemberControllerecom::class, 'update']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// API routes for member operations (stateless, no CSRF)
Route::post('member/signup', [MemberController::class, 'signup']);
Route::post('member/signin', [MemberController::class, 'signin']);
Route::post('member/check-sponsor', [MemberController::class, 'checkSponsor']);
Route::post('member/internal-add', [MemberController::class, 'internalAdd']);
Route::get('/member/dashboard', [MemberController::class, 'dashboard']);
Route::get('member/dashboard-stats', [MemberController::class, 'dashboardStats']);
Route::get('member/active-team', [MemberController::class, 'activeTeam']);
Route::post('member/activate-package', [MemberController::class, 'activatePackage']);
Route::get('member/consistency-status', [RepurchaseWalletStatusController::class, 'index']);
Route::get('member/repurchase-status', [LoyaltyBonusController::class, 'repurchaseStatus']);
Route::get('member/products', [AdminProductController::class, 'memberProducts']);
Route::post('member/products/purchase', [AdminProductController::class, 'purchaseFromWallet']);
Route::get('/member/tree', [MemberController::class, 'tree']);
Route::get('member/profile', [MemberController::class, 'profile']);
Route::put('member/profile', [MemberController::class, 'updateProfile']);
Route::get('member/income-summary', [IncomeSummaryController::class, 'index']);
Route::get('member/income-report', [IncomeReportController::class, 'index']);
Route::get('member/earning-balance-withdrawal', [EarningBalanceController::class, 'withdrawal']);
Route::get('member/earning-balance-history', [EarningBalanceController::class, 'history']);
Route::get('member/kyc', [MemberController::class, 'getKyc']);
Route::put('member/kyc', [MemberController::class, 'upsertKyc']);
Route::get('member/id-card', [MemberController::class, 'getIdCard']);
Route::post('member/id-card', [MemberController::class, 'uploadIdCard']);
Route::post('member/check-sponsor', [MemberController::class, 'checkSponsor']);
Route::post('member/internal-add', [MemberController::class, 'internalAdd']);
Route::get('/downline', [MemberController::class, 'getDownline']);
Route::get('/matching-status', [MemberController::class, 'matchingStatus']);
Route::get('member/diwali-status', [DiwaliBonusController::class, 'status']);
Route::get('bonuses/diwali', [DiwaliBonusController::class, 'index']);
Route::post('bonuses/diwali/calculate', [DiwaliBonusController::class, 'calculateYearly']);
Route::get('member/royalty-status', [RoyaltyClubBonusController::class, 'status']);
Route::get('bonuses/royalty-club', [RoyaltyClubBonusController::class, 'index']);
Route::post('bonuses/royalty-club/calculate', [RoyaltyClubBonusController::class, 'calculateMonthly']);
Route::get('member/business-monitoring-status', [BusinessMonitoringBonusController::class, 'status']);
Route::get('bonuses/business-monitoring', [BusinessMonitoringBonusController::class, 'index']);
Route::post('bonuses/business-monitoring/calculate', [BusinessMonitoringBonusController::class, 'calculateCycle']);
Route::get('bonuses/leadership-rank', [LeadershipRankBonusController::class, 'index']);
Route::post('bonuses/leadership-rank/calculate', [LeadershipRankBonusController::class, 'calculateCycle']);
Route::get('bonuses/family-saver', [FamilySaverBonusController::class, 'index']);
Route::post('bonuses/family-saver/calculate', [FamilySaverBonusController::class, 'calculateMonthly']);
Route::get('bonuses/branch-turnover', [BranchTurnoverBonusController::class, 'index']);
Route::post('bonuses/branch-turnover/calculate', [BranchTurnoverBonusController::class, 'calculateMonthly']);
Route::get('bonuses/loyalty', [LoyaltyBonusController::class, 'index']);
Route::post('bonuses/loyalty/calculate-monthly', [LoyaltyBonusController::class, 'calculateMonthly']);
Route::post('bonuses/loyalty/calculate-consistency', [LoyaltyBonusController::class, 'calculateConsistencyBonus']);
Route::get('bonuses/group-builtup', [GroupBuiltupBonusController::class, 'index']);
Route::post('bonuses/group-builtup/calculate', [GroupBuiltupBonusController::class, 'calculateCycle']);
Route::get('bonuses/travel-club', [TravelClubBonusController::class, 'index']);
Route::get('branches', [BranchController::class, 'index']);
Route::get('branches/referral', [BranchController::class, 'referralBranch']);
Route::post('messages/compose', [MemberMessageController::class, 'compose']);
Route::get('messages/inbox', [MemberMessageController::class, 'inbox']);
Route::get('messages/outbox', [MemberMessageController::class, 'outbox']);
Route::get('/rank-rewards',[RankRewardController::class,'rankRewards']);
// Route::get('/member/consistency-status', [ConsistencyStatusController::class, 'index']);
// Route::post('/member/consistency-status/update-monthly-purchase', [ConsistencyStatusController::class, 'updateMonthlyPurchase']);