<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pendaftar extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'pendaftars';

    protected $fillable = [
        'program_id',
        'nama',
        'email',
        'no_hp',
        'password',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPendaftaran::class, 'program_id');
    }

    public function pendaftaran(): HasOne
    {
        return $this->hasOne(Pendaftaran::class, 'pendaftar_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'pendaftar_id');
    }
}
