import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    FileText,
    UploadCloud,
    Download,
    Eye,
    CheckCircle2,
    AlertCircle,
    Check
} from 'lucide-react';

const BerkasPersyaratan = () => {
    const { pendaftar, program, pendaftaran, isLulus, fetchUser } = useAuth();
    const navigate = useNavigate();

    const [docsToUpload, setDocsToUpload] = useState({});
    const [submittingApp, setSubmittingApp] = useState(false);
    const [appMsg, setAppMsg] = useState(null);
    const [appError, setAppError] = useState(null);

    const [revisiFile, setRevisiFile] = useState({});
    const [revisiSubmitting, setRevisiSubmitting] = useState(false);
    const [revisiMsg, setRevisiMsg] = useState(null);

    // If awardee, redirect to archive page
    if (isLulus) {
        return <Navigate to="/arsip-berkas" replace />;
    }

    if (!pendaftar) return null;

    // Submit Initial Application Documents
    const handleAppSubmit = async (e) => {
        e.preventDefault();
        setSubmittingApp(true);
        setAppError(null);
        setAppMsg(null);

        const formData = new FormData();
        Object.entries(docsToUpload).forEach(([jenisId, file]) => {
            if (file) {
                formData.append(`dokumen[${jenisId}]`, file);
            }
        });

        try {
            const res = await api.post('/applications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setAppMsg('Pendaftaran dan dokumen persyaratan berhasil dikirim!');
                await fetchUser();
                navigate('/status-seleksi');
            }
        } catch (err) {
            setAppError(err.response?.data?.message || 'Gagal mengirim berkas persyaratan.');
        } finally {
            setSubmittingApp(false);
        }
    };

    // Submit Revised Document
    const handleReviseSubmit = async (docId) => {
        const file = revisiFile[docId];
        if (!file) return;

        setRevisiSubmitting(true);
        setRevisiMsg(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/applications/documents/${docId}/revise`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setRevisiMsg('Dokumen perbaikan berhasil dikirim!');
                setRevisiFile((prev) => ({ ...prev, [docId]: null }));
                await fetchUser();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengunggah dokumen revisi.');
        } finally {
            setRevisiSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Dokumen Persyaratan Beasiswa
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Pastikan seluruh dokumen bertipe PDF dan berukuran maksimal 2MB per berkas.
                </p>
            </div>

            {appMsg && (
                <div className="p-3 sm:p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{appMsg}</span>
                </div>
            )}

            {revisiMsg && (
                <div className="p-3 sm:p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{revisiMsg}</span>
                </div>
            )}

            <form onSubmit={handleAppSubmit}>
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-gray-100 flex items-center space-x-3">
                        <div className="p-2 bg-green-50 text-[#3B996D] rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                Berkas Persyaratan Administrasi
                            </h3>
                            <p className="text-[11px] sm:text-xs text-gray-500">
                                {program?.nama_program || 'Program Beasiswa'}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {appError && (
                            <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span>{appError}</span>
                            </div>
                        )}

                        {program && program.jenis_dokumen && program.jenis_dokumen.length > 0 ? (
                            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                                {program.jenis_dokumen.map((dok) => {
                                    const uploadedDok = pendaftaran?.dokumen?.find((d) => d.jenis_dokumen_id === dok.id);
                                    return (
                                        <div
                                            key={dok.id}
                                            className="p-3.5 sm:p-5 bg-white transition-all duration-300 hover:bg-gray-50 group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                                        >
                                            <div className="flex-1 min-w-0 flex items-center space-x-3 sm:space-x-4">
                                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-50 text-[#3B996D] rounded-lg flex items-center justify-center">
                                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                                            {dok.nama_dokumen}
                                                            {dok.wajib && (
                                                                <span className="text-red-500 font-bold ml-0.5">*</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 group-hover:text-gray-500">
                                                        Format PDF, Maksimal 2MB
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start sm:items-end space-y-2 w-full sm:w-auto">
                                                {pendaftaran ? (
                                                    uploadedDok ? (
                                                        uploadedDok.status_dokumen === 'Perlu Revisi' ? (
                                                            <>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 mb-1">
                                                                    Perlu Direvisi
                                                                </span>
                                                                {uploadedDok.catatan_revisi && (
                                                                    <div className="text-[11px] text-left text-red-700 bg-red-50 p-2 border border-red-200 rounded-md w-full max-w-xs mb-2">
                                                                        <strong>Catatan:</strong> {uploadedDok.catatan_revisi}
                                                                    </div>
                                                                )}
                                                                <div className="w-full flex flex-col gap-2">
                                                                    <input
                                                                        type="file"
                                                                        accept=".pdf"
                                                                        onChange={(e) =>
                                                                            setRevisiFile({
                                                                                ...revisiFile,
                                                                                [uploadedDok.id]: e.target.files[0],
                                                                            })
                                                                        }
                                                                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer transition-colors"
                                                                    />
                                                                    {revisiFile[uploadedDok.id] && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleReviseSubmit(uploadedDok.id)}
                                                                            disabled={revisiSubmitting}
                                                                            className="w-full inline-flex justify-center items-center px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                                                                        >
                                                                            {revisiSubmitting ? 'Mengirim...' : 'Kirim Ulang File'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                                                                        uploadedDok.status_dokumen === 'Sesuai'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-blue-100 text-blue-800'
                                                                    }`}
                                                                >
                                                                    {uploadedDok.status_dokumen || 'Tersimpan'}
                                                                </span>
                                                                <a
                                                                    href={`/storage/${uploadedDok.file_path}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-2.5 py-1 rounded-md"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                                                    Lihat File
                                                                </a>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Tidak ada file</span>
                                                    )
                                                ) : (
                                                    <input
                                                        type="file"
                                                        required={dok.wajib}
                                                        accept=".pdf"
                                                        onChange={(e) =>
                                                            setDocsToUpload({
                                                                ...docsToUpload,
                                                                [dok.id]: e.target.files[0],
                                                            })
                                                        }
                                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#3B996D] file:text-white hover:file:bg-[#2e7d58] file:cursor-pointer transition-colors"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-xs sm:text-sm text-gray-500 py-4">
                                Tidak ada dokumen persyaratan.
                            </p>
                        )}
                    </div>

                    {!pendaftaran && (
                        <div className="flex flex-col sm:flex-row justify-end px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100 gap-3 sm:gap-0">
                            <button
                                type="submit"
                                disabled={submittingApp}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 bg-[#3B996D] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#2e7d58] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
                            >
                                {submittingApp ? 'Menyimpan...' : 'Kirim Pendaftaran'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default BerkasPersyaratan;
