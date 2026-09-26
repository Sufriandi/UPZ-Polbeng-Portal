<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Penyaluran extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'penyalurans';

    protected $fillable = [
        'tanggal',
        'kategori',
        'jumlah',
        'kegiatan',
        'metode_penyaluran',
        'nama_penerima',
        'email',
        'no_hp',
        'dicatat_oleh',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'float',
    ];
}
