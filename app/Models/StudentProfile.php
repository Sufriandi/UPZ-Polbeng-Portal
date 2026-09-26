<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'students_profile';

    protected $fillable = [
        'user_id',
        'nim',
        'full_name',
        'jurusan',
        'prodi',
        'angkatan',
        'semester',
        'ipk',
        'phone',
        'address',
        'nik',
        'bank_account_name',
        'bank_account_number',
        'bank_name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
