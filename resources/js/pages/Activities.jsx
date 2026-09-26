import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Clock, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const res = await api.get('/activities');
            if (res.data.success) {
                setActivities(res.data.data);
            }
        } catch (e) {
            console.error('Failed to load activities', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Kegiatan Monitoring Beasiswa
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Jadwal kegiatan pembinaan dan pelatihan wajib bagi mahasiswa penerima beasiswa UPZ Polbeng
                </p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(n => (
                        <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Belum Ada Jadwal Kegiatan</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Saat ini belum ada kegiatan pembinaan aktif yang dijadwalkan untuk Anda.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((act) => (
                        <div
                            key={act.id}
                            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                        Kegiatan Wajib
                                    </span>
                                    {act.attendance ? (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            act.attendance.status === 'Hadir' 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                : act.attendance.status === 'Hadir-Mencurigakan'
                                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            Status: {act.attendance.status}
                                        </span>
                                    ) : act.is_open_now ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 animate-pulse">
                                            Sesi Absensi Terbuka
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                            Sesi Belum Dibuka
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">{act.title}</h3>
                                    {act.description && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.description}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                            {new Date(act.start_time).toLocaleDateString('id-ID', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} - {new Date(act.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{act.location_name} (Radius: {act.radius_meters}m)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                                {act.attendance ? (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Sudah Melakukan Absensi</span>
                                    </div>
                                ) : act.can_attend ? (
                                    <Link
                                        to={`/attendance/capture/${act.id}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>Buka Kamera &amp; Absen</span>
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
                                    >
                                        Belum Waktu Absensi
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Activities;
