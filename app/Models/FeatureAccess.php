<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeatureAccess extends Model
{
    use HasFactory;

    protected $table = 'feature_accesses';

    protected $fillable = [
        'feature',
        'email',
        'granted_by',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Cek apakah user atau email tertentu memiliki akses terhadap fitur tertentu.
     */
    public static function hasAccess(string $feature, string $email): bool
    {
        $email = trim($email);
        if (!$email) {
            return false;
        }

        return static::where('feature', $feature)
            ->where('email', $email)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Ambil seluruh fitur yang diizinkan untuk email tertentu.
     */
    public static function getAllowedFeatures(string $email): array
    {
        $email = trim($email);
        if (!$email) {
            return [];
        }

        return static::where('email', $email)
            ->where('is_active', true)
            ->pluck('feature')
            ->toArray();
    }
}
