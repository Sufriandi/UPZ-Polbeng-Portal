import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    ArrowLeft, 
    FileText, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Building2, 
    Upload, 
    Check, 
    XCircle, 
    Calendar 
} from 'lucide-react';

const ApplicationStatus = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revisingDocId, setRevisingDocId] = useState(null);
    const [revisionFile, setRevisionFile] = useState(null);
    const [revisionLoading, setRevisionLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        loadApplication();
    }, [id]);

    const loadApplication = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/applications/${id}`);
            if (res.data.success) {
                setApplication(res.data.data);
            }
        } catch (e) {
            console.error('Failed to load application status', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadRevision = async (docId) => {
        if (!revisionFile) return;

        setRevisionLoading(true);
        setMsg(null);

        const formData = new FormData();
        formData.append('document', revisionFile);

        try {
            const res = await api.post(`/applications/${application.id}/documents/${docId}/revise`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setMsg('Dokumen revisi berhasil diunggah ulang.');
                setRevisingDocId(null);
                setRevisionFile(null);
                loadApplication();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengunggah dokumen revisi.');
        } finally {
            setRevisionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <p className="text-sm font-bold text-slate-700">Data pendaftaran tidak ditemukan.</p>
                <Link to="/applications" className="text-xs text-emerald-600 font-bold mt-2 inline-block">
                    &larr; Kembali ke daftar pengajuan saya
                </Link>
            </div>
        );
    }

    const isKerjasama = application.program?.program_type === 'kerjasama';

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <Link
                to="/applications"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Pengajuan</span>
            </Link>

            {msg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{msg}</span>
                </div>
            )}

            {/* Application Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Nomor Registrasi: {application.application_number}
                        </span>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                            {application.program?.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {isKerjasama ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                Mitra: {application.program?.partner_name}
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                Mandiri UPZ Polbeng
                            </span>
                        )}
                    </div>
                </div>

                {/* Stepper Visual Timeline */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                        Progres Seleksi &amp; Status
                    </h2>

                    {isKerjasama ? (
                        /* Alur 2 Tahap Kerjasama */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Tahap Awal</div>
                                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Diajukan
                                </div>
                                <div className="text-[10px] text-slate-500">Berkas pendaftaran diterima sistem</div>
                            </div>

                            <div className={`p-3 rounded-xl border shadow-sm space-y-1 ${
                                application.stage1_status === 'Kandidat'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : application.stage1_status === 'Tidak Lolos Tahap 1'
                                    ? 'bg-red-50 border-red-200 text-red-900'
                                    : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Tahap 1 (Internal UPZ)</div>
                                <div className="font-extrabold flex items-center gap-1.5">
                                    {application.stage1_status === 'Kandidat' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-amber-500" />
                                    )}
                                    Status: {application.stage1_status}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    {application.stage1_status === 'Kandidat'
                                        ? 'Ditetapkan sebagai kandidat nominee ke mitra'
                                        : 'Verifikasi berkas oleh tim UPZ Polbeng'}
                                </div>
                            </div>

                            <div className={`p-3 rounded-xl border shadow-sm space-y-1 ${
                                application.stage2_status === 'Lolos'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : application.stage2_status === 'Tidak Lolos'
                                    ? 'bg-red-50 border-red-200 text-red-900'
                                    : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Tahap 2 (Mitra Eksternal)</div>
                                <div className="font-extrabold flex items-center gap-1.5">
                                    {application.stage2_status === 'Lolos' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-slate-400" />
                                    )}
                                    Keputusan: {application.stage2_status || 'Menunggu'}
                                </div>
                                <div className="text-[10px] text-slate-500">Penetapan akhir surat resmi mitra</div>
                            </div>
                        </div>
                    ) : (
                        /* Alur 1 Tahap Mandiri */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Tahap 1</div>
                                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Diajukan
                                </div>
                            </div>

                            <div className={`p-3 rounded-xl border shadow-sm space-y-1 ${
                                application.stage1_status === 'Diverifikasi'
                                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                                    : application.stage1_status === 'Perlu Revisi'
                                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                                    : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Tahap 2</div>
                                <div className="font-extrabold flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    Verifikasi Berkas
                                </div>
                                <div className="text-[10px] text-slate-500">{application.stage1_status}</div>
                            </div>

                            <div className={`p-3 rounded-xl border shadow-sm space-y-1 ${
                                application.stage1_status === 'Lolos'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : application.stage1_status === 'Tidak Lolos'
                                    ? 'bg-red-50 border-red-200 text-red-900'
                                    : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Tahap 3</div>
                                <div className="font-extrabold flex items-center gap-1.5">
                                    {application.stage1_status === 'Lolos' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-slate-400" />
                                    )}
                                    Keputusan Akhir
                                </div>
                                <div className="text-[10px] text-slate-500">{application.stage1_status}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Dokumen & Revisi */}
                <div className="pt-2">
                    <h2 className="text-sm font-extrabold text-slate-900 mb-3">Status Berkas Dokumen</h2>
                    <div className="space-y-3">
                        {application.documents?.map((doc) => (
                            <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-slate-800">{doc.requirement?.document_name || doc.file_name}</div>
                                        <div className="text-[10px] text-slate-400">Ukuran: {(doc.file_size / 1024).toFixed(0)} KB</div>
                                        {doc.notes && (
                                            <div className="mt-1 text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md inline-block">
                                                Catatan Admin: {doc.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                        doc.status === 'Valid'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : doc.status === 'Perlu Revisi'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {doc.status}
                                    </span>

                                    {doc.status === 'Perlu Revisi' && (
                                        <div>
                                            {revisingDocId === doc.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => setRevisionFile(e.target.files[0])}
                                                        className="text-[11px]"
                                                    />
                                                    <button
                                                        onClick={() => handleUploadRevision(doc.id)}
                                                        disabled={revisionLoading || !revisionFile}
                                                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                                                    >
                                                        Upload
                                                    </button>
                                                    <button
                                                        onClick={() => setRevisingDocId(null)}
                                                        className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[11px]"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setRevisingDocId(doc.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm"
                                                >
                                                    <Upload className="w-3 h-3" />
                                                    Unggah Revisi
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status History Log */}
                {application.status_logs && application.status_logs.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                        <h2 className="text-sm font-extrabold text-slate-900 mb-3">Histori Perubahan Status</h2>
                        <div className="space-y-2.5">
                            {application.status_logs.map((log) => (
                                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-slate-800">
                                            Status diubah ke: <span className="text-emerald-700 font-extrabold">{log.new_status}</span>
                                        </div>
                                        {log.notes && <div className="text-slate-500 mt-0.5">{log.notes}</div>}
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            Oleh {log.changed_by || 'Sistem'} &bull; {new Date(log.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationStatus;
