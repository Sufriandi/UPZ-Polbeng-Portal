<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\FeatureAccess;
use App\Models\Penyaluran;
use App\Models\StudentBankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DisbursementController extends Controller
{
    /**
     * Ambil informasi rekening bank mahasiswa yang sedang login.
     */
    public function getBankInfo(Request $request)
    {
        $user = $request->user();

        if (!FeatureAccess::hasAccess('disbursement_info', $user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses fitur data rekening & penyaluran belum diaktifkan oleh Super Admin.',
            ], 403);
        }

        $bankAccount = StudentBankAccount::where('pendaftar_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'data' => $bankAccount,
        ]);
    }

    /**
     * Simpan / perbarui data rekening bank mahasiswa.
     */
    public function updateBankInfo(Request $request)
    {
        $user = $request->user();

        if (!FeatureAccess::hasAccess('disbursement_info', $user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses fitur data rekening & penyaluran belum diaktifkan oleh Super Admin.',
            ], 403);
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:150',
            'passbook_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $bankAccount = StudentBankAccount::where('pendaftar_id', $user->id)->first();

        $path = $bankAccount ? $bankAccount->passbook_file_path : null;

        if ($request->hasFile('passbook_file')) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            $file = $request->file('passbook_file');
            $fileName = time() . '_buku_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $path = $file->storeAs('student_passbooks', $fileName, 'public');
        }

        // Jika nomor rekening atau nama bank diubah, status verifikasi di-reset ke false agar dicek ulang oleh admin
        $isAccountChanged = $bankAccount && (
            $bankAccount->account_number !== $validated['account_number'] ||
            $bankAccount->bank_name !== $validated['bank_name']
        );

        $bankAccount = StudentBankAccount::updateOrCreate(
            ['pendaftar_id' => $user->id],
            [
                'bank_name' => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'account_holder_name' => $validated['account_holder_name'],
                'passbook_file_path' => $path,
                'is_verified' => $isAccountChanged ? false : ($bankAccount ? $bankAccount->is_verified : false),
                'verified_by' => $isAccountChanged ? null : ($bankAccount ? $bankAccount->verified_by : null),
                'verified_at' => $isAccountChanged ? null : ($bankAccount ? $bankAccount->verified_at : null),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Data rekening bank berhasil disimpan!',
            'data' => $bankAccount,
        ]);
    }

    /**
     * Ambil riwayat penyaluran dana beasiswa dari tabel penyalurans berdasarkan email mahasiswa.
     */
    public function getDisbursements(Request $request)
    {
        $user = $request->user();

        if (!FeatureAccess::hasAccess('disbursement_info', $user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses fitur riwayat penyaluran belum diaktifkan oleh Super Admin.',
            ], 403);
        }

        // Ambil data dari tabel penyalurans berdasarkan email pendaftar dan kategori Pendidikan
        $disbursements = Penyaluran::where('email', $user->email)
            ->where('kategori', 'Pendidikan')
            ->orderBy('tanggal', 'desc')
            ->get();

        $totalReceived = $disbursements->sum('jumlah');

        return response()->json([
            'success' => true,
            'data' => [
                'disbursements' => $disbursements,
                'total_received' => $totalReceived,
            ],
        ]);
    }
}
