import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const LeaveRequestModal = ({ isOpen, onClose, activity, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Reset state setiap kali modal dibuka atau kegiatan berganti
    useEffect(() => {
        if (isOpen) {
            setReason('');
            setProofFile(null);
            setError(null);
            setSuccessMsg(null);
        }
    }, [isOpen, activity]);

    if (!isOpen || !activity) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!reason.trim()) {
            setError('Silakan isi alasan permohonan izin.');
            return;
        }

        if (!proofFile) {
            setError('Wajib melampirkan berkas bukti (Surat Dokter, Surat Tugas, atau berkas pendukung resmi).');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('activity_id', activity.id);
            formData.append('reason', reason);
            formData.append('proof_file', proofFile);

            const res = await api.post('/leave-requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setSuccessMsg('Pengajuan izin berhasil dikirim. Menunggu verifikasi dari panitia UPZ Polbeng.');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1200);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim pengajuan izin. Silakan coba kembali.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 transition-opacity">
            <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200 flex flex-col">
                {/* Header Modal */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                Pengajuan Izin Kegiatan
                            </h3>
                            <p className="text-xs text-slate-500">
                                Formulir permohonan izin ketidakhadiran mahasiswa
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                    {/* Ringkasan Kegiatan */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Kegiatan
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                            {activity.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                            {new Date(activity.start_time).toLocaleString('id-ID')}
                            {activity.location_name ? ` &bull; ${activity.location_name}` : ''}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Alasan Permohonan Izin <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={3}
                            placeholder="Tuliskan keterangan alasan izin Anda secara jelas..."
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-slate-900 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Berkas Bukti Pendukung <span className="text-rose-500">*</span>
                        </label>
                        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition">
                            <input
                                type="file"
                                required
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={(e) => setProofFile(e.target.files[0] || null)}
                                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5">
                                Format: PDF, JPG, atau PNG (Maksimal 5MB). Foto akan dikompresi otomatis.
                            </p>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-[#3B996D] hover:bg-[#2e7d58] text-white rounded-lg font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? 'Mengirim...' : 'Kirim Pengajuan Izin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveRequestModal;
