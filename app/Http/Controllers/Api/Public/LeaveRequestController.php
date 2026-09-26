<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\FeatureAccess;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LeaveRequestController extends Controller
{
    /**
     * Ambil riwayat pengajuan izin kegiatan mahasiswa yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!FeatureAccess::hasAccess('leave_request', $user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum memiliki izin akses untuk fitur pengajuan izin kegiatan. Hubungi Super Admin.',
            ], 403);
        }

        $requests = LeaveRequest::with('activity')
            ->where('pendaftar_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Ajukan izin / dispensasi ketidakhadiran kegiatan baru.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!FeatureAccess::hasAccess('leave_request', $user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses fitur pengajuan izin terbatas. Hubungi Super Admin.',
            ], 403);
        }

        $validated = $request->validate([
            'activity_id' => 'required|integer|exists:activities,id',
            'reason' => 'required|string|min:5|max:1000',
            'proof_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // Maksimal 5MB
        ]);

        $activity = Activity::findOrFail($validated['activity_id']);

        // Cek apakah sudah pernah mengajukan untuk kegiatan ini
        $existing = LeaveRequest::where('pendaftar_id', $user->id)
            ->where('activity_id', $activity->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengajuan izin Anda untuk kegiatan ini telah disetujui sebelumnya.',
                ], 422);
            }

            if ($existing->status === 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda telah memiliki pengajuan izin yang sedang menunggu verifikasi admin untuk kegiatan ini.',
                ], 422);
            }
        }

        $file = $request->file('proof_file');
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
        $path = $file->storeAs('leave_proofs', $fileName, 'public');

        $leaveRequest = LeaveRequest::updateOrCreate(
            [
                'pendaftar_id' => $user->id,
                'activity_id' => $activity->id,
            ],
            [
                'reason' => $validated['reason'],
                'proof_file_path' => $path,
                'proof_file_name' => $file->getClientOriginalName(),
                'status' => 'pending',
                'rejection_note' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );

        $leaveRequest->load('activity');

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin kegiatan berhasil dikirim. Menunggu verifikasi admin UPZ.',
            'data' => $leaveRequest,
        ], 201);
    }
}
