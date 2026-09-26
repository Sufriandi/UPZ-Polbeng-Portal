<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\AssistanceProgram;
use App\Models\AssistanceProgramRequirement;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Mahasiswa Sampel
        $student = User::firstOrCreate(
            ['email' => 'mahasiswa@polbeng.ac.id'],
            [
                'name' => 'Ahmad Fauzi',
                'nim' => '1203201001',
                'password' => Hash::make('password123'),
                'role' => 'mahasiswa',
                'is_active' => true,
            ]
        );

        StudentProfile::firstOrCreate(
            ['user_id' => $student->id],
            [
                'nim' => '1203201001',
                'full_name' => 'Ahmad Fauzi',
                'jurusan' => 'Teknik Informatika',
                'prodi' => 'D4 Rekayasa Perangkat Lunak',
                'angkatan' => '2024',
                'semester' => 4,
                'ipk' => 3.85,
                'phone' => '081275661234',
                'address' => 'Jl. Bathin Alam, Sungai Alam, Bengkalis',
                'bank_name' => 'Bank Syariah Indonesia (BSI)',
                'bank_account_number' => '7123984729',
                'bank_account_name' => 'Ahmad Fauzi',
            ]
        );

        // 2. Program Mandiri UPZ Polbeng
        $progMandiri = AssistanceProgram::firstOrCreate(
            ['slug' => 'beasiswa-prestasi-upz-polbeng-2026'],
            [
                'name' => 'Beasiswa Mahasiswa Berprestasi UPZ Polbeng 2026',
                'description' => "Program beasiswa prestasi mandiri yang disalurkan oleh Unit Pengumpul Zakat (UPZ) Politeknik Negeri Bengkalis untuk membantu mahasiswa aktif berprestasi akademik maupun non-akademik.\n\nSeleksi dilakukan 1 tahap langsung oleh tim verifikator UPZ Polbeng.",
                'type' => 'beasiswa',
                'program_type' => 'mandiri',
                'partner_name' => null,
                'quota' => 25,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(25),
                'status' => 'opened',
                'terms' => "- Mahasiswa aktif Polbeng minimal semester 2.\n- IPK minimal 3.25.\n- Tidak sedang menerima beasiswa penuh dari instansi lain.\n- Bersedia mengikuti seluruh rangkaian kegiatan pembinaan UPZ.",
            ]
        );

        AssistanceProgramRequirement::firstOrCreate(
            ['assistance_program_id' => $progMandiri->id, 'document_name' => 'Kartu Tanda Mahasiswa (KTM)'],
            ['description' => 'Scan berwarna KTM yang masih aktif', 'is_required' => true, 'allowed_mimes' => 'pdf,jpg,png', 'max_size_kb' => 2048]
        );
        AssistanceProgramRequirement::firstOrCreate(
            ['assistance_program_id' => $progMandiri->id, 'document_name' => 'Transkrip Nilai Terakhir'],
            ['description' => 'Transkrip resmi yang disahkan oleh Ketua Jurusan', 'is_required' => true, 'allowed_mimes' => 'pdf', 'max_size_kb' => 3072]
        );
        AssistanceProgramRequirement::firstOrCreate(
            ['assistance_program_id' => $progMandiri->id, 'document_name' => 'Surat Pernyataan Tidak Menerima Beasiswa Lain'],
            ['description' => 'Surat pernyataan bermaterai 10.000', 'is_required' => true, 'allowed_mimes' => 'pdf', 'max_size_kb' => 2048]
        );

        // 3. Program Kerjasama Eksternal (2 Tahap Seleksi)
        $progKerjasama = AssistanceProgram::firstOrCreate(
            ['slug' => 'beasiswa-kerjasama-baznas-provinsi-riau-2026'],
            [
                'name' => 'Beasiswa Kerjasama BAZNAS Provinsi Riau 2026',
                'description' => "Program beasiswa kemitraan antara UPZ Polbeng dengan BAZNAS Provinsi Riau.\n\nSeleksi dilaksanakan dalam 2 tahap:\n- Tahap 1: Verifikasi berkas & penetapan nominasi kandidat oleh tim UPZ Polbeng.\n- Tahap 2: Keputusan final penerima resmi ditetapkan oleh BAZNAS Provinsi Riau.",
                'type' => 'beasiswa',
                'program_type' => 'kerjasama',
                'partner_name' => 'BAZNAS Provinsi Riau',
                'quota' => 50,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(30),
                'status' => 'opened',
                'terms' => "- Mahasiswa berasal dari keluarga mustahik (asnaf fakir/miskin).\n- Terdaftar aktif di Polbeng.\n- Mengisi formulir dan melampirkan berkas lengkap.",
            ]
        );

        AssistanceProgramRequirement::firstOrCreate(
            ['assistance_program_id' => $progKerjasama->id, 'document_name' => 'Kartu Keluarga (KK)'],
            ['description' => 'Scan kartu keluarga resmi', 'is_required' => true, 'allowed_mimes' => 'pdf,jpg,png', 'max_size_kb' => 2048]
        );
        AssistanceProgramRequirement::firstOrCreate(
            ['assistance_program_id' => $progKerjasama->id, 'document_name' => 'Surat Keterangan Tidak Mampu (SKTM)'],
            ['description' => 'SKTM dari Kepala Desa / Kelurahan setempat', 'is_required' => true, 'allowed_mimes' => 'pdf', 'max_size_kb' => 3072]
        );
        AssistanceProgramRequirement::firstOrCreate(
            ['assistance_program_id' => $progKerjasama->id, 'document_name' => 'KTM dan KTP'],
            ['description' => 'KTM Polbeng dan KTP pendaftar', 'is_required' => true, 'allowed_mimes' => 'pdf,jpg,png', 'max_size_kb' => 2048]
        );

        // 4. Jadwal Kegiatan Monitoring Perdana
        Activity::firstOrCreate(
            ['title' => 'Sosialisasi & Pembinaan Karakter Penerima Beasiswa UPZ'],
            [
                'assistance_program_id' => $progMandiri->id,
                'description' => 'Pertemuan wajib penerima beasiswa UPZ Polbeng untuk pengarahan program dan sosialisasi tata tertib monitoring.',
                'location_name' => 'Aula Gedung Utama Polbeng, Lt. 3',
                'latitude' => 1.45520000,
                'longitude' => 102.14650000,
                'radius_meters' => 10.00, // Default 10 meter toleransi ruang aula
                'start_time' => now()->subHour(1),
                'end_time' => now()->addHours(5),
                'is_mandatory' => true,
                'is_active' => true,
            ]
        );
    }
}
