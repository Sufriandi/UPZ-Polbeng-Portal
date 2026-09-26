<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Pendaftar;
use App\Models\ProgramPendaftaran;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Registrasi langsung untuk program beasiswa tertentu via slug.
     */
    public function registerForProgram(Request $request, $slug)
    {
        $program = ProgramPendaftaran::with('tahapan')
            ->where('slug', $slug)
            ->where('status_publikasi', 'published')
            ->where(function ($q) {
                $q->where('is_archived', false)->orWhereNull('is_archived');
            })
            ->firstOrFail();

        // Cek timeline pendaftaran
        $today = Carbon::now()->format('Y-m-d');
        $tahapPendaftaran = $program->tahapan->first(function ($t) {
            return str_contains(strtolower($t->nama_tahap), 'pendaftaran');
        });

        if ($tahapPendaftaran && $tahapPendaftaran->tanggal_mulai && $tahapPendaftaran->tanggal_selesai) {
            $isOpen = ($today >= $tahapPendaftaran->tanggal_mulai->format('Y-m-d') && $today <= $tahapPendaftaran->tanggal_selesai->format('Y-m-d'));
            if (!$isOpen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Periode pendaftaran untuk program ini belum dibuka atau sudah berakhir.',
                ], 422);
            }
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'no_hp' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Cek apakah email sudah terdaftar pada program INI
        $exists = Pendaftar::where('email', $validated['email'])
            ->where('program_id', $program->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Email ini sudah terdaftar pada program ini. Silakan masuk / login.',
            ], 422);
        }

        $pendaftar = Pendaftar::create([
            'program_id' => $program->id,
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'no_hp' => $validated['no_hp'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $pendaftar->createToken('portal_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran akun berhasil!',
            'data' => [
                'token' => $token,
                'pendaftar' => $pendaftar,
                'program' => $program,
            ],
        ], 201);
    }

    /**
     * Login pendaftar dengan email dan password.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $throttleKey = Str::transliterate(Str::lower($validated['email']) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Terlalu banyak percobaan login. Silakan tunggu {$seconds} detik lagi.",
            ], 429);
        }

        $pendaftar = Pendaftar::where('email', $validated['email'])
            ->with(['program', 'pendaftaran'])
            ->latest()
            ->first();

        if (!$pendaftar || !Hash::check($validated['password'], $pendaftar->password)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json([
                'success' => false,
                'message' => 'Email atau password yang Anda masukkan salah.',
            ], 401);
        }

        RateLimiter::clear($throttleKey);

        $token = $pendaftar->createToken('portal_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'data' => [
                'token' => $token,
                'pendaftar' => $pendaftar,
                'program' => $pendaftar->program,
            ],
        ]);
    }

    /**
     * Ambil data profil & status pendaftar yang sedang login.
     */
    public function me(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();
        $pendaftar->load([
            'program.jenisDokumen',
            'program.tahapan',
            'pendaftaran.dokumen.jenisDokumen',
            'pendaftaran.dokumen.riwayat',
        ]);

        $pendaftaran = $pendaftar->pendaftaran;
        $status = $pendaftaran ? $pendaftaran->status : 'Belum Submit';

        // Syarat mahasiswa lulus untuk membuka fitur monitoring
        $isLulus = in_array($status, ['Lulus', 'Lulus Final', 'Lolos']);

        return response()->json([
            'success' => true,
            'data' => [
                'pendaftar' => $pendaftar,
                'program' => $pendaftar->program,
                'pendaftaran' => $pendaftaran,
                'is_lulus' => $isLulus,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Perbarui data profil pendaftar.
     */
    public function updateProfile(Request $request)
    {
        /** @var Pendaftar $pendaftar */
        $pendaftar = $request->user();

        $rules = [
            'nama' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:20',
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $validated = $request->validate($rules);

        $pendaftar->nama = $validated['nama'];
        if (isset($validated['no_hp'])) {
            $pendaftar->no_hp = $validated['no_hp'];
        }

        if (!empty($validated['password'])) {
            $pendaftar->password = Hash::make($validated['password']);
        }

        $pendaftar->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $pendaftar,
        ]);
    }

    /**
     * Logout pendaftar.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil logout.',
        ]);
    }
}
