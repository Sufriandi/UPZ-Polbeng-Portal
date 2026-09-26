<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Attendance;
use App\Models\Pendaftar;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Tampilkan daftar kegiatan monitoring bagi mahasiswa yang telah LULUS seleksi.
     */
    public function index(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $pendaftaran = $pendaftar->pendaftaran;
        $status = $pendaftaran ? $pendaftaran->status : null;

        // Invariant: Hanya pendaftar yang LULUS yang dapat mengakses monitoring
        $isLulus = in_array($status, ['Lulus', 'Lulus Final', 'Lolos']);

        if (!$isLulus) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur monitoring kehadiran hanya dapat diakses oleh mahasiswa yang telah dinyatakan LULUS seleksi program beasiswa UPZ Polbeng.',
            ], 403);
        }

        $activities = Activity::where('is_active', true)
            ->where(function ($query) use ($pendaftar) {
                $query->where('program_id', $pendaftar->program_id)
                      ->orWhereNull('program_id');
            })
            ->orderBy('start_time', 'desc')
            ->get();

        $userAttendances = Attendance::where('pendaftar_id', $pendaftar->id)
            ->whereIn('activity_id', $activities->pluck('id'))
            ->get()
            ->keyBy('activity_id');

        $now = now();

        $formattedActivities = $activities->map(function ($activity) use ($userAttendances, $now) {
            $att = $userAttendances->get($activity->id);
            $canAttend = $now->between($activity->start_time, $activity->end_time) && !$att;

            return [
                'id' => $activity->id,
                'title' => $activity->title,
                'description' => $activity->description,
                'location_name' => $activity->location_name,
                'latitude' => (float) $activity->latitude,
                'longitude' => (float) $activity->longitude,
                'radius_meters' => (float) $activity->radius_meters,
                'start_time' => $activity->start_time->toISOString(),
                'end_time' => $activity->end_time->toISOString(),
                'is_mandatory' => (bool) $activity->is_mandatory,
                'is_open_now' => $now->between($activity->start_time, $activity->end_time),
                'can_attend' => $canAttend,
                'attendance' => $att,
            ];
        });

        // Hitung statistik
        $now = now();
        $totalMandatory = $activities->where('is_mandatory', true)->count();
        $totalOptional = $activities->where('is_mandatory', false)->count();

        // Hitung kegiatan wajib yang waktu akhirnya sudah lewat (sudah harus absen) ATAU user sudah absen
        $mandatoryToCount = $activities->where('is_mandatory', true)->filter(function ($act) use ($now, $userAttendances) {
            return \Carbon\Carbon::parse($act->end_time)->lt($now) || $userAttendances->has($act->id);
        })->count();

        $totalHadir = Attendance::where('pendaftar_id', $pendaftar->id)
            ->whereIn('activity_id', $activities->pluck('id'))
            ->whereIn('status', ['Hadir', 'Hadir-Mencurigakan'])
            ->count();
            
        $totalIzin = Attendance::where('pendaftar_id', $pendaftar->id)
            ->whereIn('activity_id', $activities->pluck('id'))
            ->where('status', 'Izin')
            ->count();
            
        $totalAlfa = Attendance::where('pendaftar_id', $pendaftar->id)
            ->whereIn('activity_id', $activities->pluck('id'))
            ->where('status', 'Alfa')
            ->count();

        // Persentase = (Total Hadir / Total Wajib yang sudah selesai) * 100
        // Kehadiran di kegiatan opsional menjadi bonus (bisa membuat persentase aman meski ada alfa)
        if ($mandatoryToCount > 0) {
            $percentage = round(($totalHadir / $mandatoryToCount) * 100, 1);
            if ($percentage > 100) {
                $percentage = 100.0;
            }
        } else {
            $percentage = 100.0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'activities' => $formattedActivities->values(),
                'summary' => [
                    'total_activities' => $activities->count(),
                    'total_mandatory' => $totalMandatory,
                    'total_optional' => $totalOptional,
                    'total_hadir' => $totalHadir,
                    'total_izin' => $totalIzin,
                    'total_alfa' => $totalAlfa,
                    'attendance_percentage' => $percentage,
                ],
            ],
        ]);
    }

    /**
     * Detail satu kegiatan.
     */
    public function show(Request $request, $id)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $status = $pendaftar->pendaftaran ? $pendaftar->pendaftaran->status : null;
        if (!in_array($status, ['Lulus', 'Lulus Seleksi Berkas', 'Lulus Final'])) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur monitoring kehadiran hanya dapat diakses oleh mahasiswa yang telah dinyatakan LULUS.',
            ], 403);
        }

        $activity = Activity::findOrFail($id);
        $attendance = Attendance::where('activity_id', $id)
            ->where('pendaftar_id', $pendaftar->id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'activity' => $activity,
                'attendance' => $attendance,
            ],
        ]);
    }
}
