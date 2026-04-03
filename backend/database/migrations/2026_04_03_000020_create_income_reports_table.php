<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('income_reports')) {
            return;
        }

        Schema::create('income_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->string('transaction_id', 80)->nullable();
            $table->string('bonus_name', 120)->default('Repurchase Bonus');
            $table->string('bonus_month', 7)->nullable()->index();
            $table->decimal('earned_bonus', 14, 2)->default(0);
            $table->string('status', 40)->default('pending');
            $table->date('entry_date')->nullable()->index();
            $table->date('activation_date')->nullable();
            $table->string('source_type', 40)->default('manual')->index();
            $table->timestamps();

            $table->unique(['member_id', 'transaction_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('income_reports');
    }
};
