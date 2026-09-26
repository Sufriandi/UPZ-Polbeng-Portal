import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, ArrowRight, Clock, CheckCircle2, Building2 } from 'lucide-react';

const ApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applications/me');
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (e) {
            console.error('Failed to load applications', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Riwayat Pendaftaran Bantuan
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Pantau seluruh program bantuan yang pernah Anda ajukan
                    </p>
                </div>

                <Link
                    to="/programs"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                    <span>Daftar Bantuan Baru</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(n => (
                        <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Belum Ada Riwayat Pendaftaran</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Anda belum pernah mengajukan bantuan atau beasiswa di portal UPZ Polbeng.
                    </p>
                    <Link
                        to="/programs"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                    >
                        Cari Program Tersedia
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {app.application_number}
                                    </span>
                                    {app.program?.program_type === 'kerjasama' ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            Kerjasama: {app.program?.partner_name}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                            Mandiri UPZ
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-extrabold text-slate-900">
                                    {app.program?.name}
                                </h3>

                                <div className="text-xs text-slate-400 flex items-center gap-3">
                                    <span>Diajukan: {new Date(app.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                                    <span>&bull;</span>
                                    <span>{app.documents?.length || 0} Dokumen Dilampirkan</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                    app.stage1_status === 'Lolos' || app.stage2_status === 'Lolos'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : app.stage1_status === 'Perlu Revisi'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {app.program?.program_type === 'kerjasama' && app.stage2_status
                                        ? `Tahap 2: ${app.stage2_status}`
                                        : `Tahap 1: ${app.stage1_status}`}
                                </span>

                                <Link
                                    to={`/applications/${app.id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                                >
                                    <span>Detail Status</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicationsList;
