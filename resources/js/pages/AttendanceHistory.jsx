import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    MapPin, 
    ShieldCheck, 
    Award,
    HelpCircle
} from 'lucide-react';

const AttendanceHistory = () => {
    const [attendances, setAttendances] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/attendances/me');
            if (res.data.success) {
                setAttendances(res.data.data.attendances);
                setStats(res.data.data.statistics);
            }
        } catch (e) {
            console.error('Failed to load attendance history', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Riwayat Kehadiran Mahasiswa
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Rekapitulasi absensi kegiatan pembinaan beasiswa dan evaluasi persentase kehadiran Anda
                </p>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tingkat Hadir</div>
                    <div className={`text-2xl font-black mt-1 ${
                        (stats?.attendance_percentage || 100) >= 80 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                        {stats?.attendance_percentage || 100}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Target: Min. 80%</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Hadir</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">{stats?.hadir || 0}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Valid Sesuai Lokasi</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mencurigakan</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">{stats?.mencurigakan || 0}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Menunggu Review</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Resmi</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">{stats?.izin || 0}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Keterangan Sah</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Alfa</div>
                    <div className="text-2xl font-black text-red-600 mt-1">{stats?.alfa || 0}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tanpa Keterangan</div>
                </div>
            </div>

            {/* Note Regarding Attendance Rules */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    <strong>Catatan Perhitungan:</strong> Berdasarkan ketentuan resmi UPZ Polbeng, persentase kehadiran dihitung murni dari status <strong>Hadir</strong> dibagi total kegiatan wajib. Status <strong>Izin</strong> dicatat terpisah sebagai ketidakhadiran dengan keterangan resmi (tidak dianggap pelanggaran).
                </div>
            </div>

            {/* Attendance Table Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-900">Daftar Rekapitulasi Sesi</h2>
                    <span className="text-xs text-slate-400">{attendances.length} Catatan Absensi</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
                    </div>
                ) : attendances.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                        Belum ada riwayat absensi yang tercatat.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-6">Kegiatan Monitoring</th>
                                    <th className="py-3 px-4">Waktu Server</th>
                                    <th className="py-3 px-4">Metode</th>
                                    <th className="py-3 px-4">Jarak Terhitung</th>
                                    <th className="py-3 px-6 text-right">Status Kehadiran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50/70 transition">
                                        <td className="py-4 px-6">
                                            <div className="font-extrabold text-slate-900">{att.activity?.title}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{att.activity?.location_name}</div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                                            {new Date(att.server_timestamp).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                                                {att.method}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                                            {att.distance_meters !== null ? `${att.distance_meters} meter` : '-'}
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <span className={`inline-block px-3 py-1 rounded-full font-extrabold text-xs ${
                                                att.status === 'Hadir'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : att.status === 'Hadir-Mencurigakan'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : att.status === 'Izin'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {att.status}
                                            </span>
                                            {att.note && (
                                                <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs ml-auto">
                                                    {att.note}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistory;
