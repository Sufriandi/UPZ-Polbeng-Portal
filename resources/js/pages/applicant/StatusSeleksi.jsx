import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    UploadCloud,
    User,
    FileText,
    ArrowRight
} from 'lucide-react';

const StatusSeleksi = () => {
    const { pendaftar, program, pendaftaran, isLulus } = useAuth();

    // If awardee, redirect to monitoring
    if (isLulus) {
        return <Navigate to="/monitoring" replace />;
    }

    if (!pendaftar) return null;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Status Seleksi Beasiswa
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Pantau proses verifikasi berkas dan pengumuman seleksi beasiswa Anda.
                </p>
            </div>

            {/* Status Card */}
            {pendaftaran ? (
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <div
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                            ['Lulus Seleksi Berkas', 'Lulus Final', 'Lulus'].includes(pendaftaran.status)
                                ? 'bg-green-50'
                                : pendaftaran.status === 'Ditolak'
                                ? 'bg-red-50'
                                : pendaftaran.status === 'Revisi'
                                ? 'bg-amber-50'
                                : 'bg-blue-50'
                        }`}
                    >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            {['Lulus Seleksi Berkas', 'Lulus Final', 'Lulus'].includes(pendaftaran.status) && (
                                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                            )}
                            {pendaftaran.status === 'Ditolak' && (
                                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
                            )}
                            {pendaftaran.status === 'Revisi' && (
                                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 flex-shrink-0" />
                            )}
                            {['Menunggu', 'Ditinjau'].includes(pendaftaran.status) && (
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                            )}

                            <div>
                                <p className="text-sm sm:text-base font-bold text-gray-900">
                                    Status: {pendaftaran.status}
                                </p>
                                {pendaftaran.status === 'Revisi' && pendaftaran.catatan_admin && (
                                    <p className="text-xs sm:text-sm text-gray-700 mt-0.5">
                                        Catatan Verifikator: <strong>{pendaftaran.catatan_admin}</strong>
                                    </p>
                                )}
                                {pendaftaran.status === 'Menunggu' && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                        Berkas Anda menunggu antrean untuk diproses oleh panitia.
                                    </p>
                                )}
                                {pendaftaran.status === 'Ditinjau' && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                        Berkas Anda sedang dalam tahap pemeriksaan administratif.
                                    </p>
                                )}
                                {pendaftaran.status === 'Lulus Seleksi Berkas' && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                        Selamat! Berkas Anda dinyatakan valid dan memenuhi persyaratan awal.
                                    </p>
                                )}
                                {['Lulus Final', 'Lulus'].includes(pendaftaran.status) && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                        Selamat! Anda dinyatakan Lulus sebagai penerima Beasiswa UPZ Polbeng.
                                    </p>
                                )}
                            </div>
                        </div>

                        {pendaftaran.status === 'Revisi' && (
                            <Link
                                to="/berkas"
                                className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shadow-xs gap-1.5 flex-shrink-0"
                            >
                                <UploadCloud className="w-3.5 h-3.5" />
                                Perbaiki Dokumen Sekarang
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-blue-900">Belum Mengirim Pendaftaran</h3>
                            <p className="text-xs sm:text-sm text-blue-800 mt-0.5">
                                Silakan lengkapi dokumen persyaratan, lalu klik tombol Kirim Pendaftaran.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/berkas"
                        className="inline-flex items-center px-4 py-2 bg-[#3B996D] hover:bg-[#2e7d58] text-white text-xs font-bold rounded-lg transition shadow-xs gap-1.5 flex-shrink-0"
                    >
                        Unggah Berkas Sekarang
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Informasi Pendaftar Card */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50 text-gray-800">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B996D]" />
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Informasi Pendaftar</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900">{pendaftar.nama}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nomor HP</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900">{pendaftar.no_hp || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alamat Email</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900">{pendaftar.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Kelengkapan Dokumen Card */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 text-gray-800">
                    <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B996D]" />
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">Kelengkapan Dokumen</h3>
                    </div>
                    <Link
                        to="/berkas"
                        className="text-xs font-semibold text-[#3B996D] hover:underline flex items-center gap-1"
                    >
                        Kelola Berkas
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                <div className="p-4 sm:p-6">
                    {program && program.jenis_dokumen && program.jenis_dokumen.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                            {program.jenis_dokumen.map((dok) => {
                                const isUploaded = pendaftaran?.dokumen?.find((d) => d.jenis_dokumen_id === dok.id);
                                return (
                                    <div
                                        key={dok.id}
                                        className="flex items-center justify-between p-2.5 sm:p-3 border border-gray-100 rounded-lg bg-gray-50"
                                    >
                                        <span className="text-xs font-semibold text-gray-700 truncate pr-2">
                                            {dok.nama_dokumen} {dok.wajib && <span className="text-red-500">*</span>}
                                        </span>
                                        {isUploaded ? (
                                            <span className="inline-flex items-center text-[10px] font-bold text-green-600 flex-shrink-0">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Terunggah
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-[10px] font-bold text-red-500 flex-shrink-0">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Belum Ada
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs sm:text-sm text-gray-500">Belum ada dokumen yang disyaratkan.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatusSeleksi;
