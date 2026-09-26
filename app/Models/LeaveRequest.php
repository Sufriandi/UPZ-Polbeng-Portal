<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'leave_requests';

    protected $fillable = [
        'pendaftar_id',
        'activity_id',
        'reason',
        'proof_file_path',
        'proof_file_name',
        'status', // 'pending', 'approved', 'rejected'
        'rejection_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'proof_file_url',
    ];

    public function pendaftar(): BelongsTo
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function getProofFileUrlAttribute(): ?string
    {
        if (!$this->proof_file_path) {
            return null;
        }

        return Storage::disk('public')->url($this->proof_file_path);
    }
}
