import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CameraCaptureModal from '../../components/attendance/CameraCaptureModal';
import LeaveRequestModal from '../../components/attendance/LeaveRequestModal';
import { Calendar, MapPin, Clock, Camera, RefreshCw, FileText } from 'lucide-react';

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
                            {activities.map((act) => (
                                <div
                                    key={act.id}
                                    className="p-3.5 sm:p-5 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-300 transition"
                                >
                                    <div className="space-y-1 w-full sm:w-auto">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-xs sm:text-sm text-slate-900">{act.title}</h2>
                                            {act.is_mandatory ? (
                                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                                                    Wajib
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                                                    Opsional
                                                </span>
                                            )}
                                        </div>
                                        {act.description && (
                                            <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>
                                        )}
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 text-xs text-slate-500 pt-0.5">
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
                                    </div>
                                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                                        {act.attendance ? (
                                            <span
                                                className={`w-full sm:w-auto text-center px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1 ${
                                                    act.attendance.status === 'Hadir'
                                                        ? 'bg-green-100 text-green-700'
                                                        : act.attendance.status === 'Izin'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}
                                            >
                                                ✓ {act.attendance.status}
                                            </span>
                                        ) : leaveRequestsMap[act.id] ? (
                                            (() => {
                                                const lr = leaveRequestsMap[act.id];
                                                if (lr.status === 'pending') {
                                                    return (
                                                        <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center justify-center gap-1">
                                                            ⏳ Menunggu Verifikasi Izin
                                                        </span>
                                                    );
                                                }
                                                if (lr.status === 'approved') {
                                                    return (
                                                        <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 inline-flex items-center justify-center gap-1">
                                                            ✓ Izin Disetujui
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <div className="flex flex-col items-stretch sm:items-end gap-1.5">
                                                        <span
                                                            className="w-full sm:w-auto text-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 inline-flex items-center justify-center gap-1"
                                                            title={lr.rejection_note || 'Pengajuan izin ditolak'}
                                                        >
                                                            ✕ Izin Ditolak
                                                        </span>
                                                        {isLeaveFeatureAllowed && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openLeaveModal(act)}
                                                                className="text-[11px] text-emerald-600 hover:underline font-semibold"
                                                            >
                                                                Ajukan Ulang Izin
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <>
                                                {act.can_attend ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(act)}
                                                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#3B996D] hover:bg-[#2e7d58] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Camera className="w-3.5 h-3.5" />
                                                        Absen Sekarang
                                                    </button>
                                                ) : new Date(act.start_time) > new Date() ? (
                                                    <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                                        Belum Dibuka
                                                    </span>
                                                ) : (
                                                    <span className="w-full sm:w-auto text-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                                                        Selesai / Ditutup
                                                    </span>
                                                )}

                                                {/* Tombol Ajukan Izin (Khusus Early Access Mahasiswa) */}
                                                {isLeaveFeatureAllowed && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openLeaveModal(act)}
                                                        className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                        title="Ajukan dispensasi izin sakit atau tugas kampus resmi"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Ajukan Izin
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
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
