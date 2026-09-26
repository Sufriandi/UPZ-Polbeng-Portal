<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\ApplicationStatusLog;
use App\Models\Notification;
use App\Models\ScholarshipRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Application::with(['user.studentProfile', 'program', 'documents']);

        if ($request->filled('assistance_program_id')) {
            $query->where('assistance_program_id', $request->assistance_program_id);
        }

        if ($request->filled('stage1_status')) {
            $query->where('stage1_status', $request->stage1_status);
        }

        if ($request->filled('stage2_status')) {
            $query->where('stage2_status', $request->stage2_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('nim', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $applications = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    public function show($id)
    {
        $application = Application::with([
            'user.studentProfile',
            'program.requirements',
            'documents.requirement',
            'statusLogs' => fn ($q) => $q->orderBy('created_at', 'desc'),
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Verifikasi & seleksi Tahap 1.
     */
    public function updateStage1(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Diajukan,Diverifikasi,Perlu Revisi,Kandidat,Tidak Lolos Tahap 1,Lolos,Tidak Lolos',
            'notes' => 'nullable|string',
            'score' => 'nullable|numeric|min:0|max:100',
            'admin_name' => 'nullable|string',
            'document_notes' => 'nullable|array', // key: doc_id, value: ['status' => '...', 'notes' => '...']
        ]);

        $application = Application::with(['program', 'user'])->findOrFail($id);

        return DB::transaction(function () use ($validated, $application) {
            $prevStatus = $application->stage1_status;
            $newStatus = $validated['status'];
            $admin = $validated['admin_name'] ?? 'Admin UPZ';

            $application->update([
                'stage1_status' => $newStatus,
                'stage1_notes' => $validated['notes'] ?? $application->stage1_notes,
                'score' => $validated['score'] ?? $application->score,
                'verified_at' => now(),
                'finalized_at' => in_array($newStatus, ['Lolos', 'Tidak Lolos', 'Tidak Lolos Tahap 1']) ? now() : null,
            ]);

            // Update status masing-masing dokumen jika ada
            if (!empty($validated['document_notes'])) {
                foreach ($validated['document_notes'] as $docId => $docData) {
                    ApplicationDocument::where('id', $docId)
                        ->where('application_id', $application->id)
                        ->update([
                            'status' => $docData['status'] ?? 'Valid',
                            'notes' => $docData['notes'] ?? null,
                        ]);
                }
            }

            // Catat log histori status
            ApplicationStatusLog::create([
                'application_id' => $application->id,
                'previous_status' => $prevStatus,
                'new_status' => $newStatus,
                'stage' => 'stage1',
                'changed_by' => $admin,
                'notes' => $validated['notes'] ?? "Status Tahap 1 diubah menjadi {$newStatus}",
            ]);

            // Jika program Mandiri dan berstatus Lolos -> catat sebagai Penerima Beasiswa
            if ($application->program->program_type === 'mandiri' && $newStatus === 'Lolos') {
                ScholarshipRecipient::firstOrCreate(
                    [
                        'user_id' => $application->user_id,
                        'assistance_program_id' => $application->assistance_program_id,
                    ],
                    [
                        'application_id' => $application->id,
                        'recipient_number' => 'REC-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                        'status' => 'active',
                        'awarded_date' => now()->toDateString(),
                    ]
                );
            }

            // Kirim notifikasi ke mahasiswa
            Notification::create([
                'user_id' => $application->user_id,
                'title' => 'Pembaruan Status Pendaftaran',
                'message' => "Pendaftaran Anda pada program '{$application->program->name}' kini berstatus: {$newStatus}.",
                'type' => 'application_status',
                'data' => [
                    'application_id' => $application->id,
                    'stage' => 'stage1',
                    'status' => $newStatus,
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status Tahap 1 berhasil diperbarui.',
                'data' => $application->fresh(['documents', 'statusLogs']),
            ]);
        });
    }

    /**
     * Input hasil keputusan final Tahap 2 (Khusus Program Kerjasama Eksternal).
     */
    public function updateStage2(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Menunggu,Lolos,Tidak Lolos',
            'notes' => 'nullable|string',
            'admin_name' => 'nullable|string',
        ]);

        $application = Application::with(['program', 'user'])->findOrFail($id);

        if ($application->program->program_type !== 'kerjasama') {
            return response()->json([
                'success' => false,
                'message' => 'Tahap 2 hanya berlaku untuk program jenis kerjasama eksternal.',
            ], 422);
        }

        return DB::transaction(function () use ($validated, $application) {
            $prevStatus = $application->stage2_status;
            $newStatus = $validated['status'];
            $admin = $validated['admin_name'] ?? 'Admin UPZ';

            $application->update([
                'stage2_status' => $newStatus,
                'stage2_notes' => $validated['notes'] ?? $application->stage2_notes,
                'finalized_at' => now(),
            ]);

            ApplicationStatusLog::create([
                'application_id' => $application->id,
                'previous_status' => $prevStatus,
                'new_status' => $newStatus,
                'stage' => 'stage2',
                'changed_by' => $admin,
                'notes' => $validated['notes'] ?? "Keputusan Final Tahap 2 diinput: {$newStatus}",
            ]);

            // Jika Lolos -> tetapkan sebagai Penerima Beasiswa resmi
            if ($newStatus === 'Lolos') {
                ScholarshipRecipient::firstOrCreate(
                    [
                        'user_id' => $application->user_id,
                        'assistance_program_id' => $application->assistance_program_id,
                    ],
                    [
                        'application_id' => $application->id,
                        'recipient_number' => 'REC-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                        'status' => 'active',
                        'awarded_date' => now()->toDateString(),
                    ]
                );
            }

            Notification::create([
                'user_id' => $application->user_id,
                'title' => 'Pengumuman Keputusan Final Beasiswa',
                'message' => "Keputusan final pihak mitra untuk program '{$application->program->name}' telah keluar: {$newStatus}.",
                'type' => 'application_status',
                'data' => [
                    'application_id' => $application->id,
                    'stage' => 'stage2',
                    'status' => $newStatus,
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Keputusan Tahap 2 berhasil disimpan.',
                'data' => $application->fresh(['documents', 'statusLogs']),
            ]);
        });
    }

    /**
     * Download/stream dokumen pendaftar untuk preview admin di backend/.
     */
    public function downloadDocument($applicationId, $documentId)
    {
        $doc = ApplicationDocument::where('application_id', $applicationId)
            ->where('id', $documentId)
            ->firstOrFail();

        if (!Storage::disk('public')->exists($doc->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File fisik tidak ditemukan pada storage portal.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($doc->file_path);

        return response()->file($fullPath, [
            'Content-Type' => $doc->mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $doc->file_name . '"',
        ]);
    }
}
