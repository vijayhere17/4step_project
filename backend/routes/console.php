<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use App\Models\Member;
use App\Models\RoyaltyClubBonus;
use App\Models\RoyaltySetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\BusinessMonitoringBonusController;
use App\Http\Controllers\LeadershipRankBonusController;
use App\Http\Controllers\BranchTurnoverBonusController;
use App\Http\Controllers\GroupBuiltupBonusController;
use App\Http\Controllers\LoyaltyBonusController;
use App\Http\Controllers\RoyaltyClubBonusController;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bonus:royalty-club {month? : Month in Y-m format} {--turnover= : Monthly company turnover amount}', function () {
    $month = $this->argument('month') ?: now()->subMonth()->format('Y-m');
    $turnoverOption = $this->option('turnover');

    if ($turnoverOption !== null && $turnoverOption !== '') {
        $turnover = (float) $turnoverOption;
        if ($turnover <= 0) {
            $this->error('Monthly turnover must be greater than 0.');
            return 1;
        }

        DB::table('company_turnovers')->updateOrInsert(
            ['month_key' => $month],
            [
                'turnover_amount' => round($turnover, 2),
                'source' => 'manual-cli',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    $request = Request::create('/api/bonuses/royalty-club/calculate', 'POST', [
        'month' => $month,
    ]);

    $response = app(RoyaltyClubBonusController::class)->calculateMonthly($request);
    $payload = $response->getData(true);

    if ($response->getStatusCode() >= 400) {
        $this->error($payload['message'] ?? 'Unable to calculate royalty bonus.');
        return 1;
    }

    $data = $payload['data'] ?? [];

    $this->info('Royalty Club bonus processed for month: ' . ($data['month'] ?? $month));
    $this->line('Monthly turnover: ' . ($data['monthly_turnover'] ?? 0));
    $this->line('Eligible users: ' . ($data['eligible_users_count'] ?? 0));
    $this->line('Per user bonus: ' . ($data['per_user_bonus'] ?? 0));

    return 0;
})->purpose('Calculate monthly Royalty Club bonus using configured pool percentage');

Artisan::command('royalty:turnover:add {month : Month in Y-m format} {amount : Monthly turnover amount}', function () {
    $month = (string) $this->argument('month');
    $amount = (float) $this->argument('amount');

    try {
        Carbon::createFromFormat('Y-m', $month)->startOfMonth();
    } catch (\Throwable $exception) {
        $this->error('Invalid month format. Use Y-m (example: 2026-03).');
        return 1;
    }

    if ($amount <= 0) {
        $this->error('Amount must be greater than 0.');
        return 1;
    }

    if (!DB::getSchemaBuilder()->hasTable('company_turnovers')) {
        $this->error('Table company_turnovers does not exist. Run php artisan migrate first.');
        return 1;
    }

    DB::table('company_turnovers')->updateOrInsert(
        ['month_key' => $month],
        [
            'turnover_amount' => round($amount, 2),
            'source' => 'manual-cli',
            'updated_at' => now(),
            'created_at' => now(),
        ]
    );

    $this->info('Company turnover saved successfully.');
    $this->line('Month: ' . $month);
    $this->line('Turnover: ' . round($amount, 2));

    return 0;
})->purpose('Add or update monthly company turnover for royalty bonus calculation');

Schedule::command('bonus:royalty-club ' . now()->subMonth()->format('Y-m') . ' --turnover=1000000')
    ->monthlyOn(1, '02:00')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Royalty Club monthly bonus cron failed.');
    });

Artisan::command('bonus:business-monitoring {cycle_date? : Cycle date in Y-m-d format} {--percentage= : Optional bonus percentage override}', function () {
    $cycleDate = $this->argument('cycle_date') ?: now()->toDateString();
    $percentageOption = $this->option('percentage');

    $overridePercentage = null;
    if ($percentageOption !== null && $percentageOption !== '') {
        $overridePercentage = (float) $percentageOption;
        if ($overridePercentage < 0 || $overridePercentage > 100) {
            $this->error('Percentage must be between 0 and 100.');
            return 1;
        }
    }

    try {
        $result = app(BusinessMonitoringBonusController::class)->runCycle($cycleDate, $overridePercentage);
    } catch (\Throwable $exception) {
        $this->error($exception->getMessage());
        return 1;
    }

    $this->info('Business Monitoring bonus processed for cycle: ' . $result['cycle_date']);
    $this->line('Percentage: ' . $result['bonus_percentage'] . '%');
    $this->line('Generated rows: ' . $result['generated_rows']);
    $this->line('Inserted rows: ' . $result['inserted_rows']);
    $this->line('Total matching income: ' . $result['total_matching_income']);
    $this->line('Total bonus amount: ' . $result['total_bonus_amount']);

    return 0;
})->purpose('Calculate direct sponsor Business Monitoring bonus for a cycle date');

Schedule::command('bonus:business-monitoring ' . now()->toDateString())
    ->dailyAt('03:00')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Business Monitoring daily bonus cron failed.');
    });

Artisan::command('bonus:leadership-rank {cycle_date? : Cycle date in Y-m-d format}', function () {
    $cycleDate = $this->argument('cycle_date') ?: now()->toDateString();

    try {
        $result = app(LeadershipRankBonusController::class)->runCycle($cycleDate);
    } catch (\Throwable $exception) {
        $this->error($exception->getMessage());
        return 1;
    }

    $this->info('Leadership Rank bonus processed for cycle: ' . $result['cycle_date']);
    $this->line('Income source column: ' . $result['income_source_column']);
    $this->line('Processed matching rows: ' . $result['processed_matching_rows']);
    $this->line('Generated rows: ' . $result['generated_rows']);
    $this->line('Inserted rows: ' . $result['inserted_rows']);
    $this->line('Total matching income: ' . $result['total_matching_income']);
    $this->line('Total bonus amount: ' . $result['total_bonus_amount']);

    return 0;
})->purpose('Calculate generation-based Leadership Rank bonus for a cycle date');

Schedule::command('bonus:leadership-rank ' . now()->toDateString())
    ->dailyAt('03:30')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Leadership Rank daily bonus cron failed.');
    });

Artisan::command('bonus:branch-turnover {month? : Month in Y-m format}', function () {
    $month = $this->argument('month') ?: now()->subMonth()->format('Y-m');

    try {
        $result = app(BranchTurnoverBonusController::class)->runMonth($month);
    } catch (\Throwable $exception) {
        $this->error($exception->getMessage());
        return 1;
    }

    $this->info('Branch Turnover bonus processed for month: ' . $result['month']);
    $this->line('Processed branches: ' . $result['processed_branches']);
    $this->line('Inserted rows: ' . $result['inserted_rows']);
    $this->line('Total turnover: ' . $result['total_turnover']);
    $this->line('Total bonus amount: ' . $result['total_bonus_amount']);

    return 0;
})->purpose('Calculate monthly Branch Turnover bonus by branch commission percentage');

Schedule::command('bonus:branch-turnover ' . now()->subMonth()->format('Y-m'))
    ->monthlyOn(1, '04:00')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Branch Turnover monthly bonus cron failed.');
    });

Artisan::command('bonus:group-builtup {cycle_date? : Cycle date in Y-m-d format}', function () {
    $cycleDate = $this->argument('cycle_date') ?: now()->toDateString();

    try {
        $result = app(GroupBuiltupBonusController::class)->runCycle($cycleDate);
    } catch (\Throwable $exception) {
        $this->error($exception->getMessage());
        return 1;
    }

    $this->info('Group Builtup bonus processed for cycle: ' . $result['cycle_date']);
    $this->line('Pair PV: ' . $result['pair_pv'] . ' (125/250/500/1000/2000/4000 by step)');
    $this->line('Processed members: ' . $result['processed_members']);
    $this->line('Eligible members: ' . $result['eligible_members']);
    $this->line('Total gross income: ' . $result['total_gross_income']);
    $this->line('Total payable income: ' . $result['total_payable_income']);
    $this->line('Total lapsed income: ' . $result['total_lapsed_income']);

    return 0;
})->purpose('Calculate daily Group Built-Up (Binary Matching) bonus');

Schedule::command('bonus:group-builtup ' . now()->toDateString())
    ->dailyAt('04:30')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Group Builtup daily bonus cron failed.');
    });

Artisan::command('repurchase:add {user_id : Member user ID} {amount : Purchase amount} {--date= : Purchase date in Y-m-d format} {--invoice= : Optional invoice number} {--status=approved : Purchase status}', function () {
    if (!DB::getSchemaBuilder()->hasTable('purchases')) {
        $this->error('Table purchases does not exist. Run php artisan migrate first.');
        return 1;
    }

    $userId = (string) $this->argument('user_id');
    $amount = (float) $this->argument('amount');
    $status = (string) $this->option('status');

    if ($amount <= 0) {
        $this->error('Amount must be greater than 0.');
        return 1;
    }

    $member = Member::query()->where('user_id', $userId)->first();

    if (!$member) {
        $this->error('Member not found for user_id: ' . $userId);
        return 1;
    }

    $dateOption = $this->option('date');
    $purchaseDate = now()->toDateString();

    if (!empty($dateOption)) {
        try {
            $purchaseDate = Carbon::createFromFormat('Y-m-d', (string) $dateOption)->toDateString();
        } catch (\Throwable $exception) {
            $this->error('Invalid --date format. Use Y-m-d.');
            return 1;
        }
    }

    $invoiceNo = (string) ($this->option('invoice') ?: 'INV-' . now()->format('YmdHis') . '-' . $member->id);

    $purchaseId = DB::table('purchases')->insertGetId([
        'member_id' => $member->id,
        'invoice_no' => $invoiceNo,
        'purchase_date' => $purchaseDate,
        'amount' => round($amount, 2),
        'cashback_amount' => 0,
        'status' => $status ?: 'approved',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->info('Repurchase purchase added successfully.');
    $this->line('Purchase ID: ' . $purchaseId);
    $this->line('Member: ' . $member->user_id . ' (' . $member->fullname . ')');
    $this->line('Amount: ' . round($amount, 2));
    $this->line('Date: ' . $purchaseDate);
    $this->line('Invoice: ' . $invoiceNo);

    return 0;
})->purpose('Add manual repurchase purchase data from terminal for dynamic status/bonus flow');

Artisan::command('bonus:loyalty-monthly {month? : Month in Y-m format}', function () {
    $month = $this->argument('month') ?: now()->format('Y-m');

    try {
        Carbon::createFromFormat('Y-m', $month)->startOfMonth();
    } catch (\Throwable $exception) {
        $this->error('Invalid month format. Use Y-m (example: 2026-03).');
        return 1;
    }

    $request = Request::create('/api/bonuses/loyalty/calculate-monthly', 'POST', [
        'month' => $month,
    ]);

    $response = app(LoyaltyBonusController::class)->calculateMonthly($request);
    $payload = $response->getData(true);

    if ($response->getStatusCode() >= 400) {
        $this->error($payload['message'] ?? 'Unable to calculate monthly loyalty bonus.');
        return 1;
    }

    $this->info('Loyalty repurchase bonus processed for month: ' . ($payload['data']['month'] ?? $month));
    $this->line('Processed members: ' . ($payload['data']['processed_members'] ?? 0));
    $this->line('Eligible members: ' . ($payload['data']['eligible_members'] ?? 0));
    $this->line('Total bonus: ' . ($payload['data']['total_bonus'] ?? 0));

    return 0;
})->purpose('Calculate monthly Loyalty Repurchase bonus from purchases');

Artisan::command('repurchase:add-all-months {user_id? : Member user ID (optional)} {--amounts= : Comma-separated 5 amounts, e.g. 500,600,700,800,900} {--base-month= : Base month in Y-m format; defaults to current month as Month 5} {--status=approved : Purchase status}', function () {
    if (!DB::getSchemaBuilder()->hasTable('purchases')) {
        $this->error('Table purchases does not exist. Run php artisan migrate first.');
        return 1;
    }

    $userId = trim((string) ($this->argument('user_id') ?: ''));
    $member = null;

    if ($userId !== '') {
        $member = Member::query()->where('user_id', $userId)->first();
    } else {
        $member = Member::query()->orderBy('id')->first();
    }

    if (!$member) {
        $this->error('Member not found. Pass a valid user_id, e.g. php artisan repurchase:add-all-months MAINDEV001');
        return 1;
    }

    $rawAmounts = trim((string) ($this->option('amounts') ?: ''));
    if ($rawAmounts === '') {
        $rawAmounts = '500,500,500,500,500';
    }

    $amountValues = array_map('trim', explode(',', $rawAmounts));
    if (count($amountValues) !== 5) {
        $this->error('Option --amounts must contain exactly 5 comma-separated values.');
        return 1;
    }

    $amounts = [];
    foreach ($amountValues as $value) {
        $amount = (float) $value;
        if ($amount <= 0) {
            $this->error('All amounts must be greater than 0.');
            return 1;
        }

        $amounts[] = round($amount, 2);
    }

    $baseMonthOption = trim((string) ($this->option('base-month') ?: ''));
    try {
        $baseDate = $baseMonthOption !== ''
            ? Carbon::createFromFormat('Y-m', $baseMonthOption)->startOfMonth()
            : Carbon::now()->startOfMonth();
    } catch (\Throwable $exception) {
        $this->error('Invalid --base-month format. Use Y-m (example: 2026-03).');
        return 1;
    }

    $status = trim((string) ($this->option('status') ?: 'approved'));
    $now = now();
    $inserted = 0;

    for ($i = 0; $i < 5; $i++) {
        $monthIndex = $i + 1;
        $monthDate = $baseDate->copy()->subMonths(4 - $i);
        $purchaseDate = $monthDate->copy()->endOfMonth()->toDateString();
        $invoiceNo = 'SEQ-' . $member->id . '-' . $monthDate->format('Ym') . '-' . $monthIndex;

        DB::table('purchases')->insert([
            'member_id' => $member->id,
            'invoice_no' => $invoiceNo,
            'purchase_date' => $purchaseDate,
            'amount' => $amounts[$i],
            'cashback_amount' => 0,
            'status' => $status,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $inserted++;

        $this->line('Month ' . $monthIndex . ' | ' . $monthDate->format('Y-m') . ' | Amount: ' . $amounts[$i]);
    }

    $this->info('Monthly repurchase entries added successfully.');
    $this->line('Member: ' . $member->user_id . ' (' . $member->fullname . ')');
    $this->line('Inserted rows: ' . $inserted);
    $this->line('Run next: php artisan bonus:loyalty-monthly ' . $baseDate->format('Y-m'));

    return 0;
})->purpose('Add manual Month 1..Month 5 purchases from terminal for dynamic consistency flow');

Artisan::command('bonus:loyalty-consistency', function () {
    $response = app(LoyaltyBonusController::class)->calculateConsistencyBonus();
    $payload = $response->getData(true);

    if ($response->getStatusCode() >= 400) {
        $this->error($payload['message'] ?? 'Unable to calculate consistency bonus.');
        return 1;
    }

    $this->info($payload['message'] ?? 'Consistency bonus calculated');
    $this->line('Qualified members: ' . ($payload['data']['qualified_members'] ?? 0));
    $this->line('Total bonus: ' . ($payload['data']['total_bonus'] ?? 0));

    return 0;
})->purpose('Calculate consistency bonus from purchases for all eligible members');
