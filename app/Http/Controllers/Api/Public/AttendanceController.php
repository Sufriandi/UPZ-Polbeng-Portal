<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Attendance;
use App\Models\Pendaftar;
use App\Services\AttendanceVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class AttendanceController extends Controller
{
    protected AttendanceVerificationService $verificationService;

    public function __construct(AttendanceVerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Submit absensi digital anti-manipulasi (Live Camera Snapshot + GPS Geolocation + Server Timestamp).
     */
    public function store(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $status = $pendaftar->pendaftaran ? $pendaftar->pendaftaran->status : null;

        // Invariant: Hanya pendaftar yang LULUS yang dapat melakukan absensi
        if (!in_array($status, ['Lulus', 'Lulus Final', 'Lolos'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mahasiswa penerima beasiswa yang telah dinyatakan LULUS yang dapat melakukan absensi.',
            ], 403);
        }

        $validated = $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:6144',
            'photo_base64' => 'nullable|string',
        ]);

        $activity = Activity::findOrFail($validated['activity_id']);

        // 1. Cek apakah sudah pernah absen untuk kegiatan ini
        $existing = Attendance::where('activity_id', $activity->id)
            ->where('pendaftar_id', $pendaftar->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan absensi untuk kegiatan ini.',
                'data' => $existing,
            ], 422);
        }

        // 2. Cek waktu kegiatan
        $now = now();
        if (!$now->between($activity->start_time, $activity->end_time)) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi absensi untuk kegiatan ini belum dimulai atau sudah berakhir.',
            ], 422);
        }

        // 3. Verifikasi Geofencing Server-side (Haversine formula)
        $distance = $this->verificationService->calculateDistance(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            (float) $activity->latitude,
            (float) $activity->longitude
        );

        $verification = $this->verificationService->verifyGeofence(
            $distance,
            (float) $activity->radius_meters
        );

        // 4. Simpan foto snapshot kamera live (baik via file upload maupun base64 capture)
        $path = null;
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $fileName = 'att_' . $activity->id . '_' . $pendaftar->id . '_' . time() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs("attendances/{$activity->id}", $fileName, 'public');
        } elseif (!empty($validated['photo_base64'])) {
            $base64Image = $validated['photo_base64'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
                $type = strtolower($type[1]);
                if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
                    $type = 'jpg';
                }
                $imageData = base64_decode($base64Image);
                if ($imageData !== false) {
                    $fileName = 'att_' . $activity->id . '_' . $pendaftar->id . '_' . time() . '.' . $type;
                    $path = "attendances/{$activity->id}/{$fileName}";
                    Storage::disk('public')->put($path, $imageData);
                }
            }
        }

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Foto bukti kehadiran dari kamera live wajib disertakan.',
            ], 422);
        }

        // 5. Simpan record absensi dengan timestamp server
        $attendance = Attendance::create([
            'activity_id' => $activity->id,
            'pendaftar_id' => $pendaftar->id,
            'method' => 'digital',
            'status' => $verification['status'], // 'Hadir' atau 'Hadir-Mencurigakan'
            'photo_path' => $path,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'distance_meters' => $distance,
            'server_timestamp' => $now,
            'note' => $verification['status'] === 'Hadir-Mencurigakan'
                ? "Absensi di luar radius toleransi ({$distance}m > {$activity->radius_meters}m)"
                : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $verification['status'] === 'Hadir'
                ? 'Absensi berhasil diverifikasi dan dicatat!'
                : 'Absensi tercatat di luar radius toleransi lokasi dan ditandai untuk peninjauan panitia.',
            'data' => [
                'id' => $attendance->id,
                'status' => $attendance->status,
                'distance_meters' => $distance,
                'radius_meters' => $activity->radius_meters,
                'server_timestamp' => $attendance->server_timestamp->toISOString(),
            ],
        ], 201);
    }

    /**
     * Riwayat absensi dan rekap persentase kehadiran pendaftar login.
     */
    public function myAttendances(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $status = $pendaftar->pendaftaran ? $pendaftar->pendaftaran->status : null;

        if (!in_array($status, ['Lulus', 'Lulus Seleksi Berkas', 'Lulus Final'])) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur monitoring hanya dapat diakses oleh mahasiswa yang telah LULUS.',
            ], 403);
        }

        $attendances = Attendance::with(['activity'])
            ->where('pendaftar_id', $pendaftar->id)
            ->orderBy('server_timestamp', 'desc')
            ->get();

        $totalMandatory = Activity::where('is_active', true)
            ->where('is_mandatory', true)
            ->where(function ($query) use ($pendaftar) {
                $query->where('program_id', $pendaftar->program_id)
                      ->orWhereNull('program_id');
            })
            ->count();

        $countHadir = $attendances->where('status', 'Hadir')->count();
        $countMencurigakan = $attendances->where('status', 'Hadir-Mencurigakan')->count();
        $countIzin = $attendances->where('status', 'Izin')->count();
        $countAlfa = $attendances->where('status', 'Alfa')->count();

        // Formula: (Total Hadir / Total Kegiatan Wajib) * 100%
        $attendancePercentage = $totalMandatory > 0
            ? round((($countHadir + $countMencurigakan) / $totalMandatory) * 100, 1)
            : 100.0;

        return response()->json([
            'success' => true,
            'data' => [
                'attendances' => $attendances,
                'statistics' => [
                    'total_mandatory_activities' => $totalMandatory,
                    'hadir' => $countHadir,
                    'mencurigakan' => $countMencurigakan,
                    'izin' => $countIzin,
                    'alfa' => $countAlfa,
                    'attendance_percentage' => $attendancePercentage,
                ],
            ],
        ]);
    }

    /**
     * Cetak Lembar Rekapitulasi Presensi Resmi (Export PDF).
     */
    public function exportPdf(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $status = $pendaftar->pendaftaran ? $pendaftar->pendaftaran->status : null;

        if (!in_array($status, ['Lulus', 'Lulus Seleksi Berkas', 'Lulus Final', 'Lolos'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya mahasiswa penerima beasiswa yang telah dinyatakan LULUS yang dapat mencetak rekap presensi.',
            ], 403);
        }

        $attendances = Attendance::with(['activity'])
            ->where('pendaftar_id', $pendaftar->id)
            ->orderBy('server_timestamp', 'desc')
            ->get();

        $totalMandatory = Activity::where('is_active', true)
            ->where('is_mandatory', true)
            ->where(function ($query) use ($pendaftar) {
                $query->where('program_id', $pendaftar->program_id)
                      ->orWhereNull('program_id');
            })
            ->count();

        $countHadir = $attendances->where('status', 'Hadir')->count();
        $countMencurigakan = $attendances->where('status', 'Hadir-Mencurigakan')->count();
        $countIzin = $attendances->where('status', 'Izin')->count();
        $countAlfa = $attendances->where('status', 'Alfa')->count();

        $attendancePercentage = $totalMandatory > 0
            ? round((($countHadir + $countMencurigakan) / $totalMandatory) * 100, 1)
            : 100.0;

        $statistics = [
            'total_mandatory' => $totalMandatory,
            'total_hadir' => $countHadir + $countMencurigakan,
            'total_izin' => $countIzin,
            'total_alfa' => $countAlfa,
            'attendance_percentage' => $attendancePercentage,
        ];

        $logoPath = public_path('UPZ_polbeng.png');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $data = [
            'pendaftar' => $pendaftar,
            'program' => $pendaftar->program,
            'attendances' => $attendances,
            'statistics' => $statistics,
            'logoBase64' => $logoBase64,
        ];

        $pdf = Pdf::loadView('pdf.rekap-kehadiran', $data)
            ->setPaper('a4', 'portrait');

        $safeName = Str::slug($pendaftar->nama, '-');
        $fileName = 'Rekap-Presensi-' . ($safeName ?: 'Mahasiswa') . '-' . now()->format('Ymd') . '.pdf';

        return $pdf->download($fileName);
    }
}
