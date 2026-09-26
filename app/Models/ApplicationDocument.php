<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'requirement_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status', // Belum Diperiksa, Valid, Tidak Valid, Perlu Revisi
        'notes',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(AssistanceProgramRequirement::class, 'requirement_id');
    }
}
