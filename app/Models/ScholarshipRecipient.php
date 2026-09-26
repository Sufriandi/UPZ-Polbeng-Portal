<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarshipRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_id',
        'assistance_program_id',
        'recipient_number',
        'status', // active, completed, revoked
        'awarded_date',
    ];

    protected $casts = [
        'awarded_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(AssistanceProgram::class, 'assistance_program_id');
    }
}
