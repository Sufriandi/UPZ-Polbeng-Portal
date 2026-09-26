<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\DokumenPendaftaran;
use App\Models\Pendaftar;
use App\Models\Pendaftaran;
use App\Models\RiwayatDokumen;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /**
     * Kirim pendaftaran beasiswa dan unggah dokumen persyaratan.
     */
    public function store(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $program = $pendaftar->program;

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program beasiswa tidak ditemukan.',
            ], 404);
        }

        // Cek jika sudah pernah submit
        $existing = Pendaftaran::where('pendaftar_id', $pendaftar->id)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah pernah mengajukan berkas pendaftaran.',
                'data' => $existing,
            ], 422);
        }

        // Susun aturan validasi dokumen
        $rules = [];
        $messages = [];
        foreach ($program->jenisDokumen as $dok) {
            $fieldName = 'dokumen.' . $dok->id;
            if ($dok->wajib) {
                $rules[$fieldName] = 'required|file|mimes:pdf|max:2048';
                $messages[$fieldName . '.required'] = "Dokumen '{$dok->nama_dokumen}' wajib dilampirkan.";
            } else {
                $rules[$fieldName] = 'nullable|file|mimes:pdf|max:2048';
            }
            $messages[$fieldName . '.mimes'] = "Dokumen '{$dok->nama_dokumen}' harus berupa file PDF.";
            $messages[$fieldName . '.max'] = "Ukuran dokumen '{$dok->nama_dokumen}' maksimal 2MB.";
        }

        $request->validate($rules, $messages);

        // Buat Pendaftaran
        $pendaftaran = Pendaftaran::create([
            'pendaftar_id' => $pendaftar->id,
            'program_id' => $program->id,
            'status' => 'Menunggu',
            'submitted_at' => now(),
        ]);

        // Simpan File Dokumen
        if ($request->hasFile('dokumen')) {
            foreach ($request->file('dokumen') as $jenisId => $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('dokumen-pendaftaran', 'public');
                    DokumenPendaftaran::create([
                        'pendaftaran_id' => $pendaftaran->id,
                        'jenis_dokumen_id' => $jenisId,
                        'file_path' => $path,
                        'status_dokumen' => 'Belum Diperiksa',
                        'uploaded_at' => now(),
                    ]);
                }
            }
        }

        $pendaftaran->load('dokumen.jenisDokumen');

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran dan berkas persyaratan berhasil dikirim!',
            'data' => $pendaftaran,
        ], 201);
    }

    /**
     * Unggah revisi dokumen yang ditolak/diminta perbaikan oleh panitia.
     */
    public function reviseDocument(Request $request, $docId)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:2048',
        ], [
            'file.required' => 'File revisi wajib diunggah.',
            'file.mimes' => 'File revisi harus berformat PDF.',
            'file.max' => 'Ukuran file revisi maksimal 2MB.',
        ]);

        $dokumen = DokumenPendaftaran::where('id', $docId)
            ->whereHas('pendaftaran', function ($q) use ($pendaftar) {
                $q->where('pendaftar_id', $pendaftar->id);
            })
            ->firstOrFail();

        if ($dokumen->status_dokumen !== 'Perlu Revisi') {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen ini tidak dalam status Perlu Revisi.',
            ], 422);
        }

        $pendaftaran = $dokumen->pendaftaran;

        // Arsipkan ke riwayat dokumen
        RiwayatDokumen::create([
            'dokumen_pendaftaran_id' => $dokumen->id,
            'file_path_lama' => $dokumen->file_path,
            'catatan_admin' => $dokumen->catatan_revisi,
            'diganti_pada' => now(),
        ]);

        // Simpan file baru
        $path = $request->file('file')->store('dokumen-pendaftaran', 'public');

        $dokumen->update([
            'file_path' => $path,
            'status_dokumen' => 'Belum Diperiksa',
            'catatan_revisi' => null,
            'uploaded_at' => now(),
        ]);

        // Jika semua dokumen yang perlu revisi sudah diperbaiki, ubah status pendaftaran ke Ditinjau
        $masihAdaRevisi = DokumenPendaftaran::where('pendaftaran_id', $pendaftaran->id)
            ->where('status_dokumen', 'Perlu Revisi')
            ->exists();

        if (!$masihAdaRevisi && $pendaftaran->status === 'Revisi') {
            $pendaftaran->update(['status' => 'Ditinjau']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Dokumen revisi berhasil diunggah.',
            'data' => [
                'dokumen' => $dokumen->fresh()->load('jenisDokumen', 'riwayat'),
                'pendaftaran_status' => $pendaftaran->fresh()->status,
            ],
        ]);
    }
}
