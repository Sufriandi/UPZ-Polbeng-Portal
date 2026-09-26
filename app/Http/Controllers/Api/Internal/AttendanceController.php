<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityParticipant;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttendanceController extends Controller
{
    /**
     * Rekap kehadiran per kegiatan (gabungan digital & manual, plus daftar yang belum hadir).
     */
    public function activityAttendances(Request $request, $activityId)
    {
        $activity = Activity::findOrFail($activityId);

        // Ambil absensi yang sudah tercatat
        $attendances = Attendance::with(['user.studentProfile'])
            ->where('activity_id', $activityId)
            ->get();

        // Ambil peserta wajib yang belum melakukan absensi
        $attendedUserIds = $attendances->pluck('user_id');
        $missingParticipants = ActivityParticipant::with(['user.studentProfile'])
            ->where('activity_id', $activityId)
            ->whereNotIn('user_id', $attendedUserIds)
            ->get()
            ->map(fn ($p) => [
                'user' => $p->user,
                'is_mandatory' => $p->is_mandatory,
                'status' => 'Belum Absen',
            ]);

        $summary = [
            'total_participants' => ActivityParticipant::where('activity_id', $activityId)->count(),
            'total_attended' => $attendances->count(),
            'hadir' => $attendances->where('status', 'Hadir')->count(),
            'mencurigakan' => $attendances->where('status', 'Hadir-Mencurigakan')->count(),
            'izin' => $attendances->where('status', 'Izin')->count(),
            'alfa' => $attendances->where('status', 'Alfa')->count(),
            'belum_absen' => $missingParticipants->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'activity' => $activity,
                'summary' => $summary,
                'attendances' => $attendances,
                'unattended_participants' => $missingParticipants,
            ],
        ]);
    }

    /**
     * Input atau review koreksi absensi (Hadir / Izin / Alfa) untuk record absensi yang sudah ada.
     */
    public function update(Request $request, $id)
    {
        $attendance = Attendance::with('user')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Hadir,Izin,Alfa,Hadir-Mencurigakan',
            'note' => 'required|string|max:500', // Wajib catatan alasan sesuai ketentuan UPZ
            'recorded_by' => 'required|string|max:255', // Audit trail admin yang menginput
        ]);

        $attendance->update([
            'status' => $validated['status'],
            'note' => $validated['note'],
            'recorded_by' => $validated['recorded_by'],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status kehadiran berhasil diubah menjadi {$attendance->status}.",
            'data' => $attendance,
        ]);
    }

    /**
     * Input absensi manual baru oleh Admin (misal karena sakit/izin, kendala teknis, atau kegiatan online).
     */
    public function storeManual(Request $request, $activityId)
    {
        $activity = Activity::findOrFail($activityId);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:Hadir,Izin,Alfa',
            'note' => 'required|string|max:500',
            'recorded_by' => 'required|string|max:255',
        ]);

        $attendance = Attendance::updateOrCreate(
            [
                'activity_id' => $activity->id,
                'user_id' => $validated['user_id'],
            ],
            [
                'method' => 'manual',
                'status' => $validated['status'],
                'note' => $validated['note'],
                'recorded_by' => $validated['recorded_by'],
                'server_timestamp' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Absensi manual berhasil disimpan.',
            'data' => $attendance->load('user.studentProfile'),
        ], 201);
    }

    /**
     * Stream foto absensi live untuk diverifikasi oleh admin di backend/.
     */
    public function downloadPhoto($id)
    {
        $attendance = Attendance::findOrFail($id);

        if (!$attendance->photo_path || !Storage::disk('public')->exists($attendance->photo_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Foto absensi tidak ditemukan pada storage.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($attendance->photo_path);

        return response()->file($fullPath, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="attendance_' . $attendance->id . '.jpg"',
        ]);
    }
}
