<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Kehadiran - {{ $pendaftar->nama }}</title>
    <style>
        @page {
            margin: 1.2cm 1.5cm;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.4;
        }
        /* KOP SURAT RESMI */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .kop-col-side {
            width: 85px;
            vertical-align: middle;
        }
        .kop-logo-img {
            width: 75px;
            height: auto;
            display: block;
        }
        .kop-col-center {
            vertical-align: middle;
            text-align: center;
        }
        .kop-title-unit {
            font-size: 13.5px;
            font-weight: bold;
            color: #047857; /* UPZ Hijau */
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .kop-title-instansi {
            font-size: 16px;
            font-weight: 800;
            color: #000000; /* Polbeng Hitam */
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .kop-address {
            font-size: 9px;
            color: #334155;
            line-height: 1.35;
        }
        .kop-divider {
            margin-top: 8px;
            margin-bottom: 18px;
        }
        .line-thick {
            border-top: 2.5px solid #000000;
        }
        .line-thin {
            border-top: 1px solid #000000;
            margin-top: 2px;
        }

        /* JUDUL DOKUMEN */
        .doc-title {
            text-align: center;
            margin-bottom: 18px;
        }
        .doc-title h2 {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            color: #0f172a;
            letter-spacing: 0.5px;
            text-decoration: underline;
        }
        .doc-title p {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 3px;
        }

        /* INFORMASI MAHASISWA */
        .info-table {
            width: 100%;
            margin-bottom: 16px;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 3px 0;
            vertical-align: top;
            font-size: 10.5px;
        }
        .info-table .label {
            width: 25%;
            color: #475569;
            font-weight: 600;
        }
        .info-table .colon {
            width: 3%;
            color: #475569;
        }
        .info-table .value {
            width: 72%;
            color: #0f172a;
            font-weight: bold;
        }

        /* TABEL LOG DATA */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .data-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-size: 9.5px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 8px 6px;
            border: 1px solid #cbd5e1;
            text-align: center;
        }
        .data-table td {
            padding: 7px 6px;
            border: 1px solid #cbd5e1;
            font-size: 9.5px;
            vertical-align: middle;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 8.5px;
            font-weight: bold;
            border-radius: 4px;
            text-align: center;
        }
        .badge-hadir {
            background-color: #dcfce7;
            color: #15803d;
        }
        .badge-mencurigakan {
            background-color: #fef3c7;
            color: #b45309;
        }
        .badge-izin {
            background-color: #e0f2fe;
            color: #0369a1;
        }
        .badge-alfa {
            background-color: #fee2e2;
            color: #b91c1c;
        }

        /* RINGKASAN PERSENTASE */
        .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 24px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 4px 6px;
            font-size: 10px;
        }

        /* TANDA TANGAN */
        .signature-section {
            width: 100%;
            margin-top: 25px;
        }
        .sig-block {
            width: 45%;
            text-align: center;
            vertical-align: top;
        }
        .sig-space {
            height: 65px;
        }
    </style>
</head>
<body>

    @php
        $logoSrc = $logoBase64 ?? (file_exists(public_path('UPZ_polbeng.png')) ? 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('UPZ_polbeng.png'))) : null);
    @endphp

    <!-- KOP SURAT RESMI -->
    <table class="kop-table">
        <tr>
            <td class="kop-col-side" style="text-align: left;">
                @if($logoSrc)
                    <img src="{{ $logoSrc }}" alt="Logo UPZ" class="kop-logo-img">
                @endif
            </td>
            <td class="kop-col-center">
                <div class="kop-title-unit">UNIT PENGUMPUL ZAKAT (UPZ)</div>
                <div class="kop-title-instansi">POLITEKNIK NEGERI BENGKALIS</div>
                <div class="kop-address">
                    Jalan Bathin Alam, Sungai Alam, Bengkalis, Riau 28711<br>
                    Laman Resmi: upz.polbeng.ac.id &bull; Pos-el: upz@polbeng.ac.id
                </div>
            </td>
            <td class="kop-col-side" style="text-align: right;">
                <!-- Penyeimbang simetris agar teks berada tepat di tengah kertas -->
            </td>
        </tr>
    </table>
    <div class="kop-divider">
        <div class="line-thick"></div>
        <div class="line-thin"></div>
    </div>

    <!-- JUDUL DOKUMEN -->
    <div class="doc-title">
        <h2>LEMBAR REKAPITULASI PRESENSI PENERIMA BEASISWA</h2>
        <p>Dokumen Resmi Pemantauan &amp; Keaktifan Mahasiswa Penerima Bantuan UPZ Politeknik Negeri Bengkalis</p>
    </div>

    <!-- DATA PENERIMA BEASISWA -->
    <table class="info-table">
        <tr>
            <td class="label">Nama Lengkap</td>
            <td class="colon">:</td>
            <td class="value">{{ $pendaftar->nama }}</td>
            <td class="label">Program Beasiswa</td>
            <td class="colon">:</td>
            <td class="value">{{ $program ? $program->nama_program : 'Beasiswa UPZ Politeknik Negeri Bengkalis' }}</td>
        </tr>
        <tr>
            <td class="label">Alamat Email</td>
            <td class="colon">:</td>
            <td class="value">{{ $pendaftar->email }}</td>
            <td class="label">Status Penetapan</td>
            <td class="colon">:</td>
            <td class="value" style="color: #047857;">Penerima Beasiswa Aktif</td>
        </tr>
        <tr>
            <td class="label">Nomor WhatsApp / HP</td>
            <td class="colon">:</td>
            <td class="value">{{ $pendaftar->no_hp ?: '-' }}</td>
            <td class="label">Tanggal Cetak</td>
            <td class="colon">:</td>
            <td class="value">{{ \Carbon\Carbon::now()->translatedFormat('d F Y - H:i') }} WIB</td>
        </tr>
    </table>

    <!-- TABEL LOG PRESENSI -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 27%;">Agenda Kegiatan</th>
                <th style="width: 18%;">Jadwal Pelaksanaan</th>
                <th style="width: 20%;">Lokasi &amp; Radius</th>
                <th style="width: 18%;">Waktu Presensi</th>
                <th style="width: 12%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $att)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $att->activity ? $att->activity->title : '-' }}</strong>
                        @if($att->activity && $att->activity->is_mandatory)
                            <span style="font-size: 8px; color: #dc2626; font-weight: bold;">(Wajib)</span>
                        @endif
                    </td>
                    <td>
                        {{ \Carbon\Carbon::parse($att->activity->start_time)->translatedFormat('d M Y') }}<br>
                        <span style="color: #64748b; font-size: 8.5px;">
                            {{ \Carbon\Carbon::parse($att->activity->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($att->activity->end_time)->format('H:i') }} WIB
                        </span>
                    </td>
                    <td>
                        {{ $att->activity ? $att->activity->location_name : '-' }}
                        @if($att->distance_meters)
                            <br><span style="color: #64748b; font-size: 8.5px;">Jarak: ~{{ round($att->distance_meters) }}m</span>
                        @endif
                    </td>
                    <td>
                        {{ \Carbon\Carbon::parse($att->server_timestamp ?: $att->created_at)->translatedFormat('d/m/Y H:i:s') }}<br>
                        <span style="color: #64748b; font-size: 8.5px;">Metode: {{ ucfirst($att->method ?: 'digital') }}</span>
                    </td>
                    <td style="text-align: center;">
                        @if($att->status === 'Hadir')
                            <span class="badge badge-hadir">HADIR</span>
                        @elseif($att->status === 'Hadir-Mencurigakan')
                            <span class="badge badge-mencurigakan">MENCURIGAKAN</span>
                        @elseif($att->status === 'Izin')
                            <span class="badge badge-izin">IZIN</span>
                        @else
                            <span class="badge badge-alfa">ALFA</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #94a3b8; padding: 16px;">
                        Belum ada riwayat kehadiran tercatat.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- RINGKASAN PERSENTASE KEHADIRAN -->
    <div class="summary-box">
        <table class="summary-table">
            <tr>
                <td style="width: 25%;"><strong>Total Kegiatan Wajib:</strong> {{ $statistics['total_mandatory'] }} Agenda</td>
                <td style="width: 25%;"><strong>Presensi Hadir:</strong> {{ $statistics['total_hadir'] }} Kali</td>
                <td style="width: 25%;"><strong>Izin / Sakit:</strong> {{ $statistics['total_izin'] }} Kali</td>
                <td style="width: 25%;"><strong>Alfa / Tanpa Ket:</strong> {{ $statistics['total_alfa'] }} Kali</td>
            </tr>
            <tr>
                <td colspan="4" style="padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <span style="font-size: 11px;">
                        Tingkat Kehadiran Kumulatif: 
                        <strong style="color: {{ $statistics['attendance_percentage'] >= 80 ? '#047857' : '#b45309' }}; font-size: 13px;">
                            {{ $statistics['attendance_percentage'] }}%
                        </strong>
                        <span style="color: #64748b; font-size: 9px; margin-left: 8px;">
                            ({{ $statistics['attendance_percentage'] >= 80 ? 'Memenuhi Standar Kelayakan Beasiswa ≥ 80%' : 'Di bawah ambang batas minimal evaluasi beasiswa' }})
                        </span>
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <!-- PENGESAHAN & TANDA TANGAN -->
    <table class="signature-section">
        <tr>
            <td class="sig-block">
                Mengetahui &amp; Menyetujui,<br>
                <strong>Mahasiswa Penerima Beasiswa</strong>
                <div class="sig-space"></div>
                <strong>{{ $pendaftar->nama }}</strong><br>
                <span style="color: #64748b;">Penerima Beasiswa UPZ Politeknik Negeri Bengkalis</span>
            </td>
            <td style="width: 10%;"></td>
            <td class="sig-block">
                Bengkalis, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                <strong>Pengelola UPZ Politeknik Negeri Bengkalis</strong>
                <div class="sig-space"></div>
                <strong>Tim Pelaksana Monitoring UPZ</strong><br>
                <span style="color: #64748b;">Politeknik Negeri Bengkalis</span>
            </td>
        </tr>
    </table>

</body>
</html>
