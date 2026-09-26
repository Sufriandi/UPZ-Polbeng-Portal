<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pendaftar_id')->constrained('pendaftars')->onDelete('cascade');
                $table->string('title');
                $table->text('message');
                $table->string('type')->default('general'); // activity_new, attendance_reminder, status_update, general
                $table->string('action_url')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->timestamps();

                $table->index(['pendaftar_id', 'is_read']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
