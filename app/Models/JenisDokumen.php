<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JenisDokumen extends Model
{
    protected $table = 'jenis_dokumens';
    protected $guarded = [];

    protected $casts = [
        'wajib' => 'boolean',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPendaftaran::class, 'program_id');
    }
}
