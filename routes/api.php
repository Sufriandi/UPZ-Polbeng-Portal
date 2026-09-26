<?php

use Illuminate\Support\Facades\Route;

// ==========================================
// 1. PUBLIC API (React SPA Mahasiswa)
// ==========================================

// Autentikasi & Registrasi Pendaftar
Route::post('/auth/register/{slug}', [App\Http\Controllers\Api\Public\AuthController::class, 'registerForProgram']);
Route::post('/auth/login', [App\Http\Controllers\Api\Public\AuthController::class, 'login']);

// Katalog Program Beasiswa (Read-only publik)
Route::get('/programs', [App\Http\Controllers\Api\Public\ProgramController::class, 'index']);
Route::get('/programs/{idOrSlug}', [App\Http\Controllers\Api\Public\ProgramController::class, 'show']);

// Rute Terproteksi Mahasiswa (Sanctum)
Route::middleware(['auth:sanctum'])->group(function () {
    // Profil & Auth
    Route::get('/auth/me', [App\Http\Controllers\Api\Public\AuthController::class, 'me']);
    Route::put('/auth/profile', [App\Http\Controllers\Api\Public\AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [App\Http\Controllers\Api\Public\AuthController::class, 'logout']);

    // Pusat Notifikasi Mahasiswa
    Route::get('/notifications', [App\Http\Controllers\Api\Public\NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [App\Http\Controllers\Api\Public\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [App\Http\Controllers\Api\Public\NotificationController::class, 'markAllAsRead']);

    // Pendaftaran Bantuan & Dokumen
    Route::post('/applications', [App\Http\Controllers\Api\Public\ApplicationController::class, 'store']);
    Route::post('/applications/documents/{docId}/revise', [App\Http\Controllers\Api\Public\ApplicationController::class, 'reviseDocument']);

    // Kegiatan & Monitoring (Hanya mahasiswa LULUS)
    Route::get('/activities', [App\Http\Controllers\Api\Public\ActivityController::class, 'index']);
    Route::get('/activities/{id}', [App\Http\Controllers\Api\Public\ActivityController::class, 'show']);

    // Absensi Anti-Manipulasi (Live Camera Snapshot + GPS Geofencing + Server Timestamp)
    Route::post('/attendances', [App\Http\Controllers\Api\Public\AttendanceController::class, 'store']);
    Route::get('/attendances/me', [App\Http\Controllers\Api\Public\AttendanceController::class, 'myAttendances']);
    Route::get('/attendances/export-pdf', [App\Http\Controllers\Api\Public\AttendanceController::class, 'exportPdf']);

    // Early Access: Fitur Pengajuan Izin / Dispensasi Kegiatan (Leave Request with Proof)
    Route::get('/leave-requests', [App\Http\Controllers\Api\Public\LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [App\Http\Controllers\Api\Public\LeaveRequestController::class, 'store']);

    // Early Access: Fitur Rekening Bank Mahasiswa & Informasi Penyaluran Bantuan (Disbursement Info)
    Route::get('/bank-account', [App\Http\Controllers\Api\Public\DisbursementController::class, 'getBankInfo']);
    Route::post('/bank-account', [App\Http\Controllers\Api\Public\DisbursementController::class, 'updateBankInfo']);
    Route::get('/disbursements', [App\Http\Controllers\Api\Public\DisbursementController::class, 'getDisbursements']);
});

