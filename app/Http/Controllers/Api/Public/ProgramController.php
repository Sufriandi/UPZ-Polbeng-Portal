<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ProgramPendaftaran;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    /**
     * Tampilkan katalog program pendaftaran yang dipublikasikan.
     */
    public function index()
    {
        $programs = ProgramPendaftaran::with(['tahapan', 'jenisDokumen'])
            ->where('status_publikasi', 'published')
            ->where(function ($q) {
                $q->where('is_archived', false)->orWhereNull('is_archived');
            })
            ->orderBy('id', 'desc')
            ->get();

        $today = Carbon::now()->format('Y-m-d');

        $formatted = $programs->map(function ($program) use ($today) {
            $tahapPendaftaran = $program->tahapan->first(function ($t) {
                return str_contains(strtolower($t->nama_tahap), 'pendaftaran');
            });

            $isOpen = true;
            if ($tahapPendaftaran && $tahapPendaftaran->tanggal_mulai && $tahapPendaftaran->tanggal_selesai) {
                $isOpen = ($today >= $tahapPendaftaran->tanggal_mulai->format('Y-m-d') && $today <= $tahapPendaftaran->tanggal_selesai->format('Y-m-d'));
            }

            return [
                'id' => $program->id,
                'nama_program' => $program->nama_program,
                'slug' => $program->slug,
                'deskripsi' => $program->deskripsi,
                'ketentuan_umum' => $program->ketentuan_umum,
                'status_publikasi' => $program->status_publikasi,
                'is_open' => $isOpen,
                'tahap_pendaftaran' => $tahapPendaftaran,
                'tahapan' => $program->tahapan,
                'jenis_dokumen' => $program->jenisDokumen,
                'created_at' => $program->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Tampilkan detail satu program bantuan berdasarkan id atau slug.
     */
    public function show($idOrSlug)
    {
        $program = ProgramPendaftaran::with(['tahapan', 'jenisDokumen'])
            ->where(function ($query) use ($idOrSlug) {
                if (is_numeric($idOrSlug)) {
                    $query->where('id', $idOrSlug);
                } else {
                    $query->where('slug', $idOrSlug);
                }
            })
            ->where('status_publikasi', 'published')
            ->where(function ($q) {
                $q->where('is_archived', false)->orWhereNull('is_archived');
            })
            ->firstOrFail();

        $today = Carbon::now()->format('Y-m-d');
        $tahapPendaftaran = $program->tahapan->first(function ($t) {
            return str_contains(strtolower($t->nama_tahap), 'pendaftaran');
        });

        $isOpen = true;
        if ($tahapPendaftaran && $tahapPendaftaran->tanggal_mulai && $tahapPendaftaran->tanggal_selesai) {
            $isOpen = ($today >= $tahapPendaftaran->tanggal_mulai->format('Y-m-d') && $today <= $tahapPendaftaran->tanggal_selesai->format('Y-m-d'));
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $program->id,
                'nama_program' => $program->nama_program,
                'slug' => $program->slug,
                'deskripsi' => $program->deskripsi,
                'ketentuan_umum' => $program->ketentuan_umum,
                'status_publikasi' => $program->status_publikasi,
                'is_open' => $isOpen,
                'tahap_pendaftaran' => $tahapPendaftaran,
                'tahapan' => $program->tahapan,
                'jenis_dokumen' => $program->jenisDokumen,
                'created_at' => $program->created_at,
            ],
        ]);
    }
}
