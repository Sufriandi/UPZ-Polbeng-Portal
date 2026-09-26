import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CameraCaptureModal from '../../components/attendance/CameraCaptureModal';
import {
    Sparkles,
    Calendar,
    Clock,
    MapPin,
    Camera,
    ArrowRight,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

const MonitoringDashboard = () => {
    const { pendaftar, program, isLulus } = useAuth();

    const [activities, setActivities] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Camera Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Route Guard: If not awardee, redirect to applicant status
    if (!isLulus) {
        return <Navigate to="/status-seleksi" replace />;
    }

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/activities');
            if (res.data.success) {
                setActivities(res.data.data.activities || []);
                setSummary(res.data.data.summary || null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat data monitoring.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        const handleRealtimeUpdate = () => {
            loadData();
        };

        window.addEventListener('upz:activity_updated', handleRealtimeUpdate);
        return () => {
            window.removeEventListener('upz:activity_updated', handleRealtimeUpdate);
        };
    }, []);

    const openModal = (act) => {
        setSelectedActivity(act);
        setModalOpen(true);
    };

    if (!pendaftar) return null;

    const openActivity = activities.find((a) => a.can_attend);
    const upcomingActivity = activities.find((a) => !a.attendance && new Date(a.start_time) > new Date());

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome Awardee Banner */}
            <div className="bg-gradient-to-r from-[#266849] to-[#3B996D] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xs relative overflow-hidden">
                <div className="relative z-10 space-y-2 sm:space-y-3">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] sm:text-xs font-bold text-white">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Penerima Beasiswa Aktif
                    </div>
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                        Selamat Datang, {pendaftar.nama}!
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                        Anda terdaftar sebagai penerima resmi <strong>{program?.nama_program || 'Beasiswa UPZ'}</strong>. Pastikan Anda selalu aktif mengikuti kegiatan pembinaan serta melakukan absensi digital presisi sesuai jadwal dan lokasi yang telah ditentukan.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
            </div>

            {/* Metrik Kehadiran */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="bg-gradient-to-br from-[#3B996D] to-[#266849] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-white shadow-xs col-span-2 sm:col-span-1">
                        <span className="text-[11px] sm:text-xs text-emerald-100 font-semibold block mb-0.5 sm:mb-1">
                            Persentase Kehadiran
                        </span>
                        <div className="text-2xl sm:text-3xl font-black">{summary.attendance_percentage}%</div>
                        <span className="text-[10px] sm:text-[11px] text-emerald-200 mt-1 block font-medium">
                            {summary.attendance_percentage >= 80 ? '✓ Status Kehadiran Aman' : '⚠️ Perlu Ditingkatkan'}
                        </span>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs">
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-0.5 sm:mb-1">
                            Kegiatan Wajib / Opsional
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-slate-900">
                            {summary.total_mandatory}{' '}
                            <span className="text-xs sm:text-sm font-semibold text-slate-400">
                                / {summary.total_optional}
                            </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">Total agenda program</span>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs">
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-0.5 sm:mb-1">
                            Total Hadir
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-emerald-600">{summary.total_hadir}</div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">Presensi tervalidasi</span>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs">
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-0.5 sm:mb-1">
                            Izin / Alfa
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-amber-600">
                            {summary.total_izin} / {summary.total_alfa}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">Ketidakhadiran tercatat</span>
                    </div>
                </div>
            )}

            {/* Action Card: Kegiatan Buka Absensi / Terdekat */}
            {openActivity ? (
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden border border-emerald-500">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 relative z-10">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold text-white mb-0.5">
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                                PRESENSI SEDANG DIBUKA SEKARANG
                            </div>
                            <h3 className="text-base sm:text-xl font-bold">{openActivity.title}</h3>
                            <div className="flex flex-wrap gap-2.5 sm:gap-4 text-xs text-emerald-100">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Pukul{' '}
                                    {new Date(openActivity.start_time).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {new Date(openActivity.end_time).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}{' '}
                                    WIB
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {openActivity.location_name} (Toleransi{' '}
                                    {openActivity.radius_meters}m)
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => openModal(openActivity)}
                            className="w-full md:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                        >
                            <Camera className="w-4 h-4 text-emerald-600" />
                            Absen Sekarang (Kamera & GPS)
                        </button>
                    </div>
                </div>
            ) : upcomingActivity ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    Agenda Terdekat
                                </span>
                                {upcomingActivity.is_mandatory && (
                                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                                        Wajib
                                    </span>
                                )}
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                                {upcomingActivity.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>
                                    <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                                    {new Date(upcomingActivity.start_time).toLocaleString('id-ID')}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>
                                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                                    {upcomingActivity.location_name}
                                </span>
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/kehadiran"
                        className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 self-stretch sm:self-center cursor-pointer"
                    >
                        Lihat Semua Jadwal
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200 text-center text-slate-500 text-xs sm:text-sm">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700">Tidak ada jadwal kegiatan aktif hari ini.</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                        Semua agenda yang telah dijadwalkan dapat Anda periksa di menu Jadwal & Absensi.
                    </p>
                </div>
            )}

            {/* Ketentuan & Panduan Presensi */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3B996D]" />
                    Ketentuan & Tata Cara Presensi Digital UPZ Polbeng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            1
                        </div>
                        <div>
                            <h5 className="font-bold text-xs text-slate-800">Geofencing Realtime</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                Perangkat wajib mengaktifkan GPS. Presensi hanya sah bila Anda berada dalam batas radius meter kegiatan.
                            </p>
                        </div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            2
                        </div>
                        <div>
                            <h5 className="font-bold text-xs text-slate-800">Live Face Detection</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                Foto snapshot diambil langsung melalui kamera dengan validasi wajah. Upload dari galeri dilarang.
                            </p>
                        </div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            3
                        </div>
                        <div>
                            <h5 className="font-bold text-xs text-slate-800">Waktu Server Sah</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                Waktu presensi dicatat otomatis oleh server UPZ, manipulasi jam perangkat pribadi tidak berpengaruh.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Kamera Presensi */}
            <CameraCaptureModal
                isOpen={modalOpen}
                activity={selectedActivity}
                onClose={() => setModalOpen(false)}
                onSuccess={loadData}
            />
        </div>
    );
};

export default MonitoringDashboard;
