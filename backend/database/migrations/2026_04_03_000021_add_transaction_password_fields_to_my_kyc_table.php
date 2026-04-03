<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('my_kyc')) {
            return;
        }

        Schema::table('my_kyc', function (Blueprint $table) {
            if (!Schema::hasColumn('my_kyc', 'transaction_password_hash')) {
                $table->string('transaction_password_hash')->nullable()->after('pan_number');
            }

            if (!Schema::hasColumn('my_kyc', 'transaction_password_status')) {
                $table->string('transaction_password_status', 20)->default('process')->after('transaction_password_hash');
            }

            if (!Schema::hasColumn('my_kyc', 'transaction_password_checked_at')) {
                $table->timestamp('transaction_password_checked_at')->nullable()->after('transaction_password_status');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('my_kyc')) {
            return;
        }

        Schema::table('my_kyc', function (Blueprint $table) {
            if (Schema::hasColumn('my_kyc', 'transaction_password_checked_at')) {
                $table->dropColumn('transaction_password_checked_at');
            }

            if (Schema::hasColumn('my_kyc', 'transaction_password_status')) {
                $table->dropColumn('transaction_password_status');
            }

            if (Schema::hasColumn('my_kyc', 'transaction_password_hash')) {
                $table->dropColumn('transaction_password_hash');
            }
        });
    }
};
