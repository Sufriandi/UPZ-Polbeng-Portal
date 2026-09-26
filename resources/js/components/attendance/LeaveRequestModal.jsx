import React, { useState } from 'react';
import api from '../../services/api';
import { X, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

const LeaveRequestModal = ({ isOpen, onClose, activity, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    if (!isOpen || !activity) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!reason.trim()) {
            setError('Silakan isi alasan pengajuan izin kegiatan.');
            return;
        }

        if (!proofFile) {
            setError('Wajib melampirkan berkas bukti (Surat Sakit Dokter atau Surat Tugas).');
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
                setSuccessMsg('Pengajuan izin berhasil dikirim! Menunggu verifikasi admin UPZ.');
                setTimeout(() => {
                    setReason('');
                    setProofFile(null);
                    setSuccessMsg(null);
                    onSuccess();
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim pengajuan izin.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
                {/* Header */}
                <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold">
                                Form Pengajuan Izin Kegiatan
                            </h3>
                            <p className="text-[11px] text-slate-300">
                                Dispensasi ketidakhadiran dengan berkas bukti resmi
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
                    {/* Activity Info Banner */}
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/80">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
                            Agenda Kegiatan
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {activity.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(activity.start_time).toLocaleString('id-ID')}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <div>
                        <label className="block font-bold text-slate-700 mb-1">
                            Alasan Izin / Sakit / Dispensasi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={3}
                            placeholder="Jelaskan alasan ketidakhadiran Anda secara terperinci (misal: Sakit dirawat di RS, atau bentrok dengan Ujian Tengah Semester)..."
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 leading-relaxed"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 mb-1">
                            Unggah Berkas Bukti Resmi <span className="text-red-500">*</span>
                        </label>
                        <p className="text-[11px] text-slate-500 mb-2">
                            Lampirkan Surat Sakit dari Dokter/Klinik atau Surat Dispensasi Tugas Kampus (PDF, JPG, PNG - Maksimal 5MB).
                        </p>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-500 transition cursor-pointer relative bg-slate-50/50">
                            <input
                                type="file"
                                required
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={(e) => setProofFile(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                            <span className="font-semibold text-slate-700 block">
                                {proofFile ? proofFile.name : 'Pilih Berkas atau Tarik ke Sini'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Format didukung: PDF, JPG, PNG
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
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
