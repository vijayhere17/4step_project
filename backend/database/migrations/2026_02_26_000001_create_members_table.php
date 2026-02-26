<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            // unique MLM identifier
            $table->string('user_id')->unique();

            // hierarchy
            $table->unsignedBigInteger('sponsor_id')->nullable()->index();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->enum('position', ['left', 'right'])->nullable();

            // personal
            $table->string('fullname');
            $table->date('dob');
            $table->string('gender')->nullable();
            $table->string('pan_number')->unique()->nullable();
            $table->string('mobile_no')->unique();
            $table->string('email')->unique()->nullable();
            $table->string('password');

            // address
            $table->text('address')->nullable();
            $table->string('pin_code')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();

            // status & activation
            $table->tinyInteger('status')->default(0)->index(); // 0 = inactive, 1 = active
            $table->timestamp('activation_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
