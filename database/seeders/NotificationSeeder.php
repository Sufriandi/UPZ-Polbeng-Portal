<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Pendaftar;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Pendaftar::all() as $p) {
            if (Notification::where('pendaftar_id', $p->id)->count() === 0) {
                Notification::create([
                    'pendaftar_id' => $p->id,
                    'title' => 'Selamat! Anda Ditetapkan Sebagai Penerima Beasiswa',
                    'message' => 'Selamat, Anda resmi dinyatakan Lulus Final sebagai penerima Beasiswa UPZ Polbeng. Pantau agenda kegiatan wajib di menu Jadwal & Absensi.',
                    'type' => 'status_update',
                    'action_url' => '/monitoring',
                    'is_read' => false,
                ]);

                Notification::create([
                    'pendaftar_id' => $p->id,
                    'title' => 'Agenda Pembinaan Baru Telah Dijadwalkan',
                    'message' => 'Panitia UPZ telah menambahkan agenda kegiatan monitoring pembinaan. Pastikan Anda hadir tepat waktu sesuai lokasi dan radius toleransi.',
                    'type' => 'activity_new',
                    'action_url' => '/kehadiran',
                    'is_read' => false,
                ]);

                Notification::create([
                    'pendaftar_id' => $p->id,
                    'title' => 'Pengingat: Jaga Kehadiran Minimal 80%',
                    'message' => 'Pastikan keaktifan kehadiran Anda pada seluruh agenda kegiatan wajib selalu terjaga untuk keberlanjutan beasiswa semester berikutnya.',
                    'type' => 'attendance_reminder',
                    'action_url' => '/riwayat-kehadiran',
                    'is_read' => false,
                ]);
            }
        }
    }
}
