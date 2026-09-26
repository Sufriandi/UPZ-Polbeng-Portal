import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, Calendar, MapPin, CheckCircle2, RefreshCw, FileDown } from 'lucide-react';

const RiwayatKehadiran = () => {
    const { isLulus } = useAuth();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [error, setError] = useState(null);

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
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat riwayat kehadiran.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const attendedActivities = activities.filter((a) => a.attendance);

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true);
        try {
            const response = await api.get('/attendances/export-pdf', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rekap-Presensi-UPZ-${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh berkas PDF rekapitulasi. Pastikan koneksi stabil.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-3.5 sm:px-6 py-3.5 sm:py-5 border-b border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 bg-emerald-50 text-[#3B996D] rounded-lg flex-shrink-0">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                                Riwayat Presensi Kegiatan
                            </h1>
                            <p className="text-[11px] sm:text-xs text-gray-500">
                                Catatan log kehadiran pada kegiatan monitoring UPZ
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf || attendedActivities.length === 0}
                            className="p-1.5 sm:px-3 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                            title="Cetak Berkas Rekapitulasi PDF"
                        >
                            {downloadingPdf ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="hidden sm:inline">Menyiapkan PDF...</span>
                                </>
                            ) : (
                                <>
                                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden sm:inline">Cetak Rekap (PDF)</span>
                                    <span className="sm:hidden">PDF</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={loadData}
                            className="p-1.5 sm:px-3 sm:py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs font-semibold cursor-pointer flex-shrink-0"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Refresh Data</span>
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-3.5 sm:p-6">
                    {loading ? (
                        <div className="p-8 sm:p-12 text-center text-slate-400 text-xs sm:text-sm">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            Memuat riwayat kehadiran...
                        </div>
                    ) : attendedActivities.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 text-slate-500 text-xs sm:text-sm border border-dashed border-slate-200 rounded-xl">
                            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700">Belum Ada Riwayat Presensi</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Presensi Anda akan otomatis tercatat di sini setelah Anda melakukan absensi pada jadwal kegiatan.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 sm:space-y-3">
                            {attendedActivities.map((act) => (
                                <div
                                    key={act.id}
                                    className="p-3.5 sm:p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-300 transition"
                                >
                                    <div className="space-y-1 w-full sm:w-auto">
                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-bold text-xs sm:text-sm text-slate-900">
                                                    {act.title}
                                                </h2>
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
                                            {/* Status Badge on Mobile */}
                                            <span
                                                className={`sm:hidden px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                                    act.attendance.status === 'Hadir'
                                                        ? 'bg-green-100 text-green-700'
                                                        : act.attendance.status === 'Hadir-Mencurigakan'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : act.attendance.status === 'Izin'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                {act.attendance.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                Waktu: {new Date(act.start_time).toLocaleString('id-ID')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                {act.location_name}{' '}
                                                {act.attendance?.distance_meters &&
                                                    `(~${act.attendance.distance_meters}m)`}
                                            </span>
                                        </div>
                                        <div className="text-[10px] sm:text-[11px] text-slate-400 pt-0.5">
                                            Presensi Server:{' '}
                                            <strong className="text-slate-600">
                                                {new Date(
                                                    act.attendance.server_timestamp || act.attendance.created_at
                                                ).toLocaleString('id-ID')}
                                            </strong>{' '}
                                            • {act.attendance.method || 'Digital'}
                                        </div>
                                    </div>

                                    {/* Status Badge on Desktop */}
                                    <div className="hidden sm:flex items-center gap-2 self-start sm:self-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                                act.attendance.status === 'Hadir'
                                                    ? 'bg-green-100 text-green-700'
                                                    : act.attendance.status === 'Hadir-Mencurigakan'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : act.attendance.status === 'Izin'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {act.attendance.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiwayatKehadiran;
