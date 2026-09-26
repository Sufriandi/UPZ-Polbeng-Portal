import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, FileCheck, FileText, Eye } from 'lucide-react';

const ArsipBerkas = () => {
    const { pendaftar, program, pendaftaran, isLulus } = useAuth();

    // Route Guard: If not awardee, redirect to applicant status
    if (!isLulus) {
        return <Navigate to="/status-seleksi" replace />;
    }

    if (!pendaftar) return null;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Arsip Dokumen Beasiswa
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Arsip data diri dan berkas kelengkapan yang Anda gunakan selama proses seleksi beasiswa.
                </p>
            </div>

            {/* Card Status Penerima */}
            <div className="bg-white shadow-xs border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-100">
                    <div className="p-2 bg-emerald-50 text-[#3B996D] rounded-lg flex-shrink-0">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                            Status Penetapan Beasiswa
                        </h2>
                        <p className="text-[11px] sm:text-xs text-gray-500">
                            Data verifikasi akhir dari pengelola UPZ Polbeng
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 pt-3.5 sm:pt-5">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Beasiswa</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-800">
                                Lulus Final (Penerima Aktif)
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Program</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900">
                            {program?.nama_program || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Terdaftar</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900">{pendaftar?.email}</p>
                    </div>
                </div>
            </div>

            {/* List Berkas Terunggah */}
            <div className="bg-white shadow-xs border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B996D]" />
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900">Dokumen Persyaratan Seleksi</h3>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Arsip Terverifikasi</span>
                </div>
                <div className="p-3.5 sm:p-6">
                    {program && program.jenis_dokumen && program.jenis_dokumen.length > 0 ? (
                        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                            {program.jenis_dokumen.map((dok) => {
                                const uploadedDok = pendaftaran?.dokumen?.find((d) => d.jenis_dokumen_id === dok.id);
                                return (
                                    <div
                                        key={dok.id}
                                        className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-50 text-[#3B996D] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                                    {dok.nama_dokumen}
                                                </p>
                                                <p className="text-[10px] sm:text-[11px] text-gray-400">
                                                    Berkas Verifikasi Administrasi
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
                                            {uploadedDok ? (
                                                <>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-green-100 text-green-800">
                                                        ✓ Valid & Sesuai
                                                    </span>
                                                    <a
                                                        href={`/storage/${uploadedDok.file_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-semibold text-[#3B996D] hover:text-[#2e7d58] flex items-center gap-1 bg-green-50 hover:bg-green-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Lihat Berkas
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Tidak ada file</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-xs sm:text-sm text-gray-500 py-4">Tidak ada data dokumen.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArsipBerkas;
