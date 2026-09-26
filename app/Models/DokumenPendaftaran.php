<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DokumenPendaftaran extends Model
{
    protected $table = 'dokumen_pendaftarans';
    protected $guarded = [];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function pendaftaran(): BelongsTo
    {
        return $this->belongsTo(Pendaftaran::class, 'pendaftaran_id');
    }

    public function jenisDokumen(): BelongsTo
    {
        return $this->belongsTo(JenisDokumen::class, 'jenis_dokumen_id');
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatDokumen::class, 'dokumen_pendaftaran_id');
    }
}
