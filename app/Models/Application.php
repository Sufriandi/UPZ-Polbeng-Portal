<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assistance_program_id',
        'application_number',
        'stage1_status', // Diajukan, Diverifikasi, Perlu Revisi, Kandidat, Tidak Lolos Tahap 1, Lolos, Tidak Lolos
        'stage2_status', // Menunggu, Lolos, Tidak Lolos (Khusus program kerjasama)
        'stage1_notes',
        'stage2_notes',
        'score',
        'submitted_at',
        'verified_at',
        'finalized_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'finalized_at' => 'datetime',
        'score' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(AssistanceProgram::class, 'assistance_program_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class, 'application_id');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ApplicationStatusLog::class, 'application_id');
    }
}
