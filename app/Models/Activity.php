<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    use HasFactory;

    protected $table = 'activities';

    protected $fillable = [
        'program_id',
        'title',
        'description',
        'location_name',
        'latitude',
        'longitude',
        'radius_meters', // default 10.0
        'start_time',
        'end_time',
        'is_mandatory',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meters' => 'float',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPendaftaran::class, 'program_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'activity_id');
    }

    protected static function booted(): void
    {
        static::created(function ($activity) {
            self::dispatchActivityNotification($activity);
        });

        static::updated(function ($activity) {
            if ($activity->wasChanged('is_active') && $activity->is_active) {
                self::dispatchActivityNotification($activity);
            }
        });
    }

    public static function dispatchActivityNotification($activity): void
    {
        if (!$activity->is_active) {
            return;
        }

        $query = Pendaftar::query();
        if ($activity->program_id) {
            $query->where('program_id', $activity->program_id);
        }

        $pendaftars = $query->where(function ($q) {
            $q->whereHas('pendaftaran', function ($pQ) {
                $pQ->whereIn('status', ['Lulus', 'Lulus Final', 'Lolos', 'Lulus Seleksi Berkas']);
            });
        })->get();

        if ($pendaftars->isEmpty()) {
            $fallbackQuery = Pendaftar::query();
            if ($activity->program_id) {
                $fallbackQuery->where('program_id', $activity->program_id);
            }
            $pendaftars = $fallbackQuery->get();
        }

        $formattedDate = $activity->start_time
            ? \Carbon\Carbon::parse($activity->start_time)->translatedFormat('d F Y, H:i') . ' WIB'
            : 'Waktu akan diumumkan';

        $location = $activity->location_name ?: 'Kampus Politeknik Negeri Bengkalis';
        $wajibText = $activity->is_mandatory ? ' (Wajib Hadir)' : '';

        $title = 'Agenda Baru: ' . $activity->title . $wajibText;
        $message = "Kegiatan '{$activity->title}' telah dijadwalkan pada {$formattedDate} di {$location}. Silakan lakukan presensi kehadiran saat kegiatan berlangsung.";

        foreach ($pendaftars as $pendaftar) {
            Notification::create([
                'pendaftar_id' => $pendaftar->id,
                'title' => $title,
                'message' => $message,
                'type' => 'activity_new',
                'action_url' => '/kehadiran',
                'is_read' => false,
                'read_at' => null,
            ]);
        }
    }
}
