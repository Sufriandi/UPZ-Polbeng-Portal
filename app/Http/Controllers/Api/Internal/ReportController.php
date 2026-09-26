<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Application;
use App\Models\AssistanceProgram;
use App\Models\Attendance;
use App\Models\ScholarshipRecipient;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Ringkasan statistik utama untuk dashboard admin di backend/.
     */
    public function summary()
    {
        $totalPrograms = AssistanceProgram::count();
        $openedPrograms = AssistanceProgram::where('status', 'opened')->count();
        $totalApplications = Application::count();
        $pendingVerification = Application::where('stage1_status', 'Diajukan')->count();
        $totalCandidates = Application::where('stage1_status', 'Kandidat')->count();
        $totalRecipients = ScholarshipRecipient::where('status', 'active')->count();

        $totalAttendances = Attendance::count();
        $hadirAttendances = Attendance::where('status', 'Hadir')->count();
        $suspiciousAttendances = Attendance::where('status', 'Hadir-Mencurigakan')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'programs' => [
                    'total' => $totalPrograms,
                    'opened' => $openedPrograms,
                ],
                'applications' => [
                    'total' => $totalApplications,
                    'pending_verification' => $pendingVerification,
                    'candidates' => $totalCandidates,
                    'recipients' => $totalRecipients,
                ],
                'attendance' => [
                    'total' => $totalAttendances,
                    'hadir' => $hadirAttendances,
                    'mencurigakan' => $suspiciousAttendances,
                ],
            ],
        ]);
    }

    /**
     * Rekap kehadiran seluruh mahasiswa penerima beasiswa.
     */
    public function recipientAttendanceReport(Request $request)
    {
        $recipients = ScholarshipRecipient::with(['user.studentProfile', 'program'])
            ->where('status', 'active')
            ->get();

        $totalActivities = Activity::where('is_active', true)->where('is_mandatory', true)->count();

        $data = $recipients->map(function ($rec) use ($totalActivities) {
            $userAttendances = Attendance::where('user_id', $rec->user_id)->get();
            $hadir = $userAttendances->where('status', 'Hadir')->count();
            $izin = $userAttendances->where('status', 'Izin')->count();
            $alfa = $userAttendances->where('status', 'Alfa')->count();
            $mencurigakan = $userAttendances->where('status', 'Hadir-Mencurigakan')->count();

            $percentage = $totalActivities > 0 ? round(($hadir / $totalActivities) * 100, 1) : 100.0;

            return [
                'user_id' => $rec->user_id,
                'nim' => $rec->user->nim,
                'name' => $rec->user->name,
                'jurusan' => $rec->user->studentProfile?->jurusan,
                'prodi' => $rec->user->studentProfile?->prodi,
                'program_name' => $rec->program->name,
                'total_mandatory' => $totalActivities,
                'hadir' => $hadir,
                'izin' => $izin,
                'alfa' => $alfa,
                'mencurigakan' => $mencurigakan,
                'percentage' => $percentage,
                'warning' => $percentage < 80, // Flag jika kehadiran < 80%
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
