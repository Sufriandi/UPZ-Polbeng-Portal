<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pendaftaran extends Model
{
    use SoftDeletes;

    protected $table = 'pendaftarans';
    protected $guarded = [];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function pendaftar(): BelongsTo
    {
        return $this->belongsTo(Pendaftar::class, 'pendaftar_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPendaftaran::class, 'program_id');
    }

    public function dokumen(): HasMany
    {
        return $this->hasMany(DokumenPendaftaran::class, 'pendaftaran_id');
    }

    protected static function booted(): void
    {
        static::saved(function (Pendaftaran $pendaftaran) {
            if ($pendaftaran->wasChanged('status')) {
                self::dispatchStatusNotification($pendaftaran);
            }
        });
    }

    public static function dispatchStatusNotification(Pendaftaran $pendaftaran): void
    {
        $status = $pendaftaran->status;
        $title = null;
        $message = null;
        $actionUrl = '/status-seleksi';

        if (in_array($status, ['Perlu Revisi', 'Revisi'])) {
            $title = 'Perlu Revisi Dokumen Persyaratan';
            $catatan = $pendaftaran->catatan_admin ? " Catatan admin: {$pendaftaran->catatan_admin}" : "";
            $message = "Terdapat dokumen pendaftaran yang memerlukan perbaikan.{$catatan} Silakan unggah perbaikan berkas Anda.";
            $actionUrl = '/berkas';
        } elseif (in_array($status, ['Lulus', 'Lulus Final', 'Lolos'])) {
            $title = 'Selamat! Anda Ditetapkan Sebagai Penerima Beasiswa';
            $message = "Selamat, Anda resmi dinyatakan LULUS sebagai penerima beasiswa UPZ Polbeng. Akses dashboard monitoring untuk melihat agenda dan presensi.";
            $actionUrl = '/monitoring';
        } elseif (in_array($status, ['Lulus Seleksi Berkas'])) {
            $title = 'Lulus Seleksi Berkas Administrasi';
            $message = "Selamat, berkas administrasi Anda telah diverifikasi dan dinyatakan LULUS. Pantau jadwal tahapan berikutnya.";
            $actionUrl = '/status-seleksi';
        } elseif (in_array($status, ['Tidak Lolos', 'Tidak Lulus'])) {
            $title = 'Pembaruan Hasil Seleksi Beasiswa';
            $message = "Mohon maaf, Anda belum berhasil pada tahapan seleksi beasiswa kali ini. Terima kasih atas partisipasi Anda.";
            $actionUrl = '/status-seleksi';
        }

        if ($title && $message && $pendaftaran->pendaftar_id) {
            Notification::create([
                'pendaftar_id' => $pendaftaran->pendaftar_id,
                'title' => $title,
                'message' => $message,
                'type' => 'status_update',
                'action_url' => $actionUrl,
                'is_read' => false,
                'read_at' => null,
            ]);
        }
    }
}
