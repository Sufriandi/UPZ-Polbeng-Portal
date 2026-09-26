<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StudentBankAccount extends Model
{
    use HasFactory;

    protected $table = 'student_bank_accounts';

    protected $fillable = [
        'pendaftar_id',
        'bank_name',
        'account_number',
        'account_holder_name',
        'passbook_file_path',
        'is_verified',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    protected $appends = [
        'passbook_file_url',
    ];

    public function pendaftar(): BelongsTo
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }

    public function getPassbookFileUrlAttribute(): ?string
    {
        if (!$this->passbook_file_path) {
            return null;
        }

        return Storage::disk('public')->url($this->passbook_file_path);
    }
}
