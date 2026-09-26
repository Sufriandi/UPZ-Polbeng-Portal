<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('program_id')->nullable()->constrained('program_pendaftarans')->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('location_name');
                $table->decimal('latitude', 10, 8);
                $table->decimal('longitude', 11, 8);
                $table->decimal('radius_meters', 6, 2)->default(10.00);
                $table->dateTime('start_time');
                $table->dateTime('end_time');
                $table->boolean('is_mandatory')->default(true);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('attendances')) {
            Schema::create('attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
                $table->foreignId('pendaftar_id')->constrained('pendaftars')->onDelete('cascade');
                $table->string('method')->default('digital'); // digital, manual
                $table->string('status')->default('Hadir'); // Hadir, Hadir-Mencurigakan, Izin, Alfa
                $table->string('photo_path')->nullable();
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
                $table->decimal('distance_meters', 8, 2)->nullable();
                $table->timestamp('server_timestamp')->useCurrent();
                $table->string('recorded_by')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->unique(['activity_id', 'pendaftar_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('activities');
    }
};
