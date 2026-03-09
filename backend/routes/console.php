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
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\BusinessMonitoringBonusController;
use App\Http\Controllers\LeadershipRankBonusController;
use App\Http\Controllers\BranchTurnoverBonusController;
use App\Http\Controllers\GroupBuiltupBonusController;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bonus:royalty-club {month? : Month in Y-m format} {--turnover= : Monthly company turnover amount}', function () {
    $month = $this->argument('month') ?: now()->subMonth()->format('Y-m');
    $turnoverOption = $this->option('turnover');

    if ($turnoverOption === null || $turnoverOption === '') {
        $this->error('Please provide --turnover value, e.g. php artisan bonus:royalty-club 2026-02 --turnover=2500000');
        return 1;
    }

    $monthlyTurnover = (float) $turnoverOption;
    if ($monthlyTurnover <= 0) {
        $this->error('Monthly turnover must be greater than 0.');
        return 1;
    }

    try {
        $periodStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
    } catch (\Throwable $exception) {
        $this->error('Invalid month format. Use Y-m (example: 2026-02).');
        return 1;
    }

    $periodEnd = $periodStart->copy()->endOfMonth();
    $monthKey = $periodStart->format('Y-m');

    try {
        $result = DB::transaction(function () use ($monthKey, $periodStart, $periodEnd, $monthlyTurnover) {
            if (RoyaltyClubBonus::query()->where('month_key', $monthKey)->exists()) {
                throw ValidationException::withMessages([
                    'month' => ["Royalty Club Bonus already calculated for {$monthKey}."],
                ]);
            }

            $poolPercentage = RoyaltySetting::getDecimalValue('royalty_pool_percentage', 3.0);
            $royaltyPoolAmount = round(($monthlyTurnover * $poolPercentage) / 100, 2);

            $eligibleQuery = Member::query()
                ->where('status', 1)
                ->where('step_level', '>=', 4)
                ->where('monthly_purchase', '>=', 500);

            $eligibleUsersCount = $eligibleQuery->count('id');
            if ($eligibleUsersCount === 0) {
                return [
                    'month' => $monthKey,
                    'eligible_users_count' => 0,
                    'per_user_bonus' => 0,
                ];
            }

            $perUserBonus = round($royaltyPoolAmount / $eligibleUsersCount, 2);
            $now = now();

            $eligibleQuery
                ->select('id')
                ->orderBy('id')
                ->chunkById(2000, function ($members) use (
                    $monthKey,
                    $periodStart,
                    $periodEnd,
                    $monthlyTurnover,
                    $poolPercentage,
                    $royaltyPoolAmount,
                    $eligibleUsersCount,
                    $perUserBonus,
                    $now
                ) {
                    $rows = [];

                    foreach ($members as $member) {
                        $rows[] = [
                            'member_id' => $member->id,
                            'month_key' => $monthKey,
                            'period_start' => $periodStart->toDateString(),
                            'period_end' => $periodEnd->toDateString(),
                            'monthly_turnover' => round($monthlyTurnover, 2),
                            'pool_percentage' => $poolPercentage,
                            'royalty_pool_amount' => $royaltyPoolAmount,
                            'eligible_users_count' => $eligibleUsersCount,
                            'bonus_amount' => $perUserBonus,
                            'status' => 'pending',
                            'calculated_at' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    if (!empty($rows)) {
                        RoyaltyClubBonus::insert($rows);
                    }
                }, 'id');

            return [
                'month' => $monthKey,
                'eligible_users_count' => $eligibleUsersCount,
                'per_user_bonus' => $perUserBonus,
            ];
        });
    } catch (ValidationException $exception) {
        $message = $exception->getMessage();
        $errors = $exception->errors();
        if (!empty($errors)) {
            $firstGroup = reset($errors);
            if (is_array($firstGroup) && !empty($firstGroup[0])) {
                $message = $firstGroup[0];
            }
        }
        $this->error($message);
        return 1;
    }

    $this->info('Royalty Club bonus processed for month: ' . $result['month']);
    $this->line('Eligible users: ' . $result['eligible_users_count']);
    $this->line('Per user bonus: ' . $result['per_user_bonus']);

    return 0;
})->purpose('Calculate monthly Royalty Club bonus using configured pool percentage');

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
    $this->line('Pair PV: ' . $result['pair_pv']);
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
