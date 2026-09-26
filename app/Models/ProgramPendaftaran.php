<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramPendaftaran extends Model
{
    use SoftDeletes;

    protected $table = 'program_pendaftarans';
    protected $guarded = [];

    protected $casts = [
        'konfigurasi_biodata' => 'array',
    ];

    public function jenisDokumen(): HasMany
    {
        return $this->hasMany(JenisDokumen::class, 'program_id');
    }

    public function tahapan(): HasMany
    {
        return $this->hasMany(TahapanProgram::class, 'program_id');
    }

    public function pendaftars(): HasMany
    {
        return $this->hasMany(Pendaftar::class, 'program_id');
    }

    public function pendaftarans(): HasMany
    {
        return $this->hasMany(Pendaftaran::class, 'program_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'program_id');
    }

    /**
     * Sanitize HTML content to prevent XSS attacks while preserving formatting.
     */
    public static function cleanHtml(?string $html): string
    {
        if (empty($html)) {
            return '';
        }

        $allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'];
        $clean = strip_tags($html, $allowedTags);

        // Remove dangerous on* event attributes
        $clean = preg_replace('/\s*on\w+\s*=\s*(["\'][^"\']*["\']|[^\s>]+)/i', '', $clean);

        // Remove javascript: pseudo-protocol
        $clean = preg_replace('/href\s*=\s*["\']\s*javascript:[^"\']*["\']/i', 'href="#"', $clean);

        return $clean;
    }

    public function getCleanDeskripsiAttribute(): string
    {
        return self::cleanHtml($this->deskripsi);
    }

    public function getCleanKetentuanUmumAttribute(): string
    {
        return self::cleanHtml($this->ketentuan_umum);
    }
}
