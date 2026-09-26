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
        Schema::create('student_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pendaftar_id')->constrained('pendaftars')->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('account_holder_name');
            $table->string('passbook_file_path')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['pendaftar_id']);
            $table->index(['is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_bank_accounts');
    }
};
