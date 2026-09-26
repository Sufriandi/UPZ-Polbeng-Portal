<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatDokumen extends Model
{
    protected $table = 'riwayat_dokumens';
    protected $guarded = [];

    protected $casts = [
        'diganti_pada' => 'datetime',
    ];

    public function dokumen(): BelongsTo
    {
        return $this->belongsTo(DokumenPendaftaran::class, 'dokumen_pendaftaran_id');
    }
}
