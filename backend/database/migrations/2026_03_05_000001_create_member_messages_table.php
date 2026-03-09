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
        Schema::create('member_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('sender_user_id')->index();
            $table->foreignId('receiver_member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('receiver_user_id')->index();
            $table->string('subject');
            $table->longText('message_details');
            $table->boolean('is_read')->default(false)->index();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_messages');
    }
};
