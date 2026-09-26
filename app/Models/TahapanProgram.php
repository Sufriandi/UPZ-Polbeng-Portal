<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TahapanProgram extends Model
{
    protected $table = 'tahapan_programs';
    protected $guarded = [];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPendaftaran::class, 'program_id');
    }
}
