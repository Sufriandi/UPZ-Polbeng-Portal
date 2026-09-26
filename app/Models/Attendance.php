<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    protected $fillable = [
        'activity_id',
        'pendaftar_id',
        'method', // digital, manual
        'status', // Hadir, Hadir-Mencurigakan, Izin, Alfa
        'photo_path',
        'latitude',
        'longitude',
        'distance_meters',
        'server_timestamp',
        'recorded_by', // admin ID if manual
        'note',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'distance_meters' => 'float',
        'server_timestamp' => 'datetime',
    ];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function pendaftar(): BelongsTo
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }
}
