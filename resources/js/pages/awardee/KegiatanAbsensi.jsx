import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CameraCaptureModal from '../../components/attendance/CameraCaptureModal';
import LeaveRequestModal from '../../components/attendance/LeaveRequestModal';
import {
    Calendar,
    MapPin,
    Clock,
    Camera,
    RefreshCw,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
} from 'lucide-react';

const KegiatanAbsensi = () => {
    const { isLulus, hasFeatureAccess } = useAuth();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal Camera
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Modal Leave Request
    const [leaveRequestsMap, setLeaveRequestsMap] = useState({});
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [selectedLeaveActivity, setSelectedLeaveActivity] = useState(null);

    const isLeaveFeatureAllowed = hasFeatureAccess('leave_request');

    // Route Guard: If not awardee, redirect to applicant status
    if (!isLulus) {
        return <Navigate to="/status-seleksi" replace />;
    }

    const loadActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/activities');
            if (res.data.success) {
                setActivities(res.data.data.activities || []);
            }

            if (isLeaveFeatureAllowed) {
                try {
                    const lrRes = await api.get('/leave-requests');
                    if (lrRes.data.success) {
                        const map = {};
                        (lrRes.data.data || []).forEach((lr) => {
                            map[lr.activity_id] = lr;
                        });
                        setLeaveRequestsMap(map);
                    }
                } catch (e) {
                    // Ignore error if not permitted
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat daftar kegiatan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();

        const handleRealtimeUpdate = () => {
            loadActivities();
        };

        window.addEventListener('upz:activity_updated', handleRealtimeUpdate);
        return () => {
            window.removeEventListener('upz:activity_updated', handleRealtimeUpdate);
        };
    }, [isLeaveFeatureAllowed]);

    const openModal = (act) => {
        setSelectedActivity(act);
        setModalOpen(true);
    };

    const openLeaveModal = (act) => {
        setSelectedLeaveActivity(act);
        setLeaveModalOpen(true);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                <div className="p-3.5 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="p-2 bg-emerald-50 text-[#3B996D] rounded-lg flex-shrink-0">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                    Jadwal Kegiatan Monitoring
                                </h1>
                                <p className="text-[11px] sm:text-xs text-slate-500">
                                    Agenda pembinaan dan sesi presensi digital mahasiswa
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={loadActivities}
                            className="p-1.5 sm:px-3 sm:py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs font-semibold cursor-pointer flex-shrink-0"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="p-8 sm:p-12 text-center text-slate-400 text-xs sm:text-sm">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            Memuat daftar kegiatan...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 text-slate-500 text-xs sm:text-sm border border-dashed border-slate-200 rounded-xl">
                            Belum ada agenda kegiatan monitoring yang dijadwalkan.
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-3.5">
                            {activities.map((act) => {
                                const lr = act.leave_request || leaveRequestsMap[act.id];
                                const att = act.attendance;
                                const isEnded = act.is_ended || (act.end_time && new Date(act.end_time) <= new Date());
                                const isUpcoming = act.start_time && new Date(act.start_time) > new Date();
                                const canAttend = act.can_attend;

                                return (
                                    <div
                                        key={act.id}
                                        className="p-4 sm:p-5 border border-slate-200/90 rounded-xl bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-300 transition shadow-2xs"
                                    >
                                        <div className="space-y-1.5 w-full sm:flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="font-bold text-sm text-slate-900">{act.title}</h2>
                                                {act.is_mandatory ? (
                                                    <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-semibold">
                                                        Wajib
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold">
                                                        Opsional
                                                    </span>
                                                )}
                                            </div>
                                            {act.description && (
                                                <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>
                                            )}
                                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-4 text-xs text-slate-500 pt-0.5">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                    {new Date(act.start_time).toLocaleString('id-ID')} -{' '}
                                                    {new Date(act.end_time).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                    {act.location_name} (Radius {act.radius_meters}m)
                                                </span>
                                            </div>

                                            {/* Poin 5: Tampilkan Catatan Penolakan Admin jika izin ditolak */}
                                            {lr && lr.status === 'rejected' && (
                                                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50/80 border border-rose-200/90 text-xs text-rose-800">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="font-semibold text-rose-900">Catatan Panitia:</span>
                                                            <p className="mt-0.5 text-rose-700 font-normal">
                                                                {lr.rejection_note || 'Pengajuan izin belum memenuhi persyaratan.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sisi Kanan: Status & Tombol Aksi */}
                                        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 flex-shrink-0">
                                            {(() => {
                                                // 1. Sudah ada record kehadiran
                                                if (att) {
                                                    if (att.status === 'Hadir' || att.status === 'Hadir-Mencurigakan') {
                                                        return (
                                                            <span className="w-full sm:w-auto text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center justify-center gap-1.5">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                Hadir
                                                            </span>
                                                        );
                                                    }
                                                    if (att.status === 'Izin') {
                                                        return (
                                                            <span className="w-full sm:w-auto text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center justify-center gap-1.5">
                                                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                                Izin Disetujui
                                                            </span>
                                                        );
                                                    }
                                                    if (att.status === 'Alfa') {
                                                        return (
                                                            <span className="w-full sm:w-auto text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center justify-center gap-1.5">
                                                                <XCircle className="w-4 h-4 text-rose-600" />
                                                                Alfa
                                                            </span>
                                                        );
                                                    }
                                                }

                                                // 2. Izin sedang menunggu verifikasi
                                                if (lr && lr.status === 'pending') {
                                                    return (
                                                        <span className="w-full sm:w-auto text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center justify-center gap-1.5">
                                                            <Clock className="w-4 h-4 text-amber-600" />
                                                            Menunggu Verifikasi
                                                        </span>
                                                    );
                                                }

                                                // 3. Izin disetujui (sebelum att tersinkronisasi)
                                                if (lr && lr.status === 'approved') {
                                                    return (
                                                        <span className="w-full sm:w-auto text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center justify-center gap-1.5">
                                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                            Izin Disetujui
                                                        </span>
                                                    );
                                                }

                                                // 4. Izin ditolak
                                                if (lr && lr.status === 'rejected') {
                                                    return (
                                                        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                            <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center justify-center gap-1.5">
                                                                <XCircle className="w-4 h-4 text-rose-600" />
                                                                {isEnded ? 'Alfa (Izin Ditolak)' : 'Izin Ditolak'}
                                                            </span>

                                                            {/* Poin 6 & 7: Ajukan Ulang Izin HANYA jika kegiatan belum selesai/tutup */}
                                                            {!isEnded && isLeaveFeatureAllowed && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openLeaveModal(act)}
                                                                    className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                                                                >
                                                                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                                                    Ajukan Ulang Izin
                                                                </button>
                                                            )}

                                                            {!isEnded && canAttend && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openModal(act)}
                                                                    className="w-full sm:w-auto px-3.5 py-1.5 bg-[#3B996D] hover:bg-[#2e7d58] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <Camera className="w-3.5 h-3.5" />
                                                                    Absen Sekarang
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                // 5. Belum presensi & belum ajukan izin
                                                return (
                                                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                        {canAttend ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => openModal(act)}
                                                                className="w-full sm:w-auto px-4 py-2 bg-[#3B996D] hover:bg-[#2e7d58] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <Camera className="w-4 h-4" />
                                                                Absen Sekarang
                                                            </button>
                                                        ) : isUpcoming ? (
                                                            <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                                                                Belum Dibuka
                                                            </span>
                                                        ) : (
                                                            <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center justify-center gap-1.5">
                                                                <XCircle className="w-4 h-4 text-rose-600" />
                                                                Alfa
                                                            </span>
                                                        )}

                                                        {/* Poin 7: Tombol Ajukan Izin HANYA jika kegiatan belum selesai/ditutup */}
                                                        {!isEnded && isLeaveFeatureAllowed && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openLeaveModal(act)}
                                                                className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <FileText className="w-4 h-4 text-emerald-600" />
                                                                Ajukan Izin
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Kamera Presensi */}
            <CameraCaptureModal
                isOpen={modalOpen}
                activity={selectedActivity}
                onClose={() => setModalOpen(false)}
                onSuccess={loadActivities}
            />

            {/* Modal Pengajuan Izin */}
            <LeaveRequestModal
                isOpen={leaveModalOpen}
                activity={selectedLeaveActivity}
                onClose={() => setLeaveModalOpen(false)}
                onSuccess={loadActivities}
            />
        </div>
    );
};

export default KegiatanAbsensi;
