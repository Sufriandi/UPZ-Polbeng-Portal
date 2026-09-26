<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistanceProgramRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'assistance_program_id',
        'document_name',
        'description',
        'is_required',
        'allowed_mimes',
        'max_size_kb',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'max_size_kb' => 'integer',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(AssistanceProgram::class, 'assistance_program_id');
    }
}
