import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
    GraduationCap,
    Calendar,
    FileCheck,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    Clock,
    ShieldCheck
} from 'lucide-react';

const ProgramDetail = () => {
    const { slug, id } = useParams();
    const identifier = slug || id;

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const res = await api.get(`/programs/${identifier}`);
                if (res.data.success) {
                    setProgram(res.data.data);
                }
            } catch (err) {
                setError('Program beasiswa tidak ditemukan atau sudah tidak aktif.');
            } finally {
                setLoading(false);
            }
        };

        fetchProgram();
    }, [identifier]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F1F5F9] flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#1D6B48] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen bg-[#F1F5F9] py-16 px-4">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Program Tidak Ditemukan</h2>
                    <p className="text-sm text-gray-600 mb-6">{error || 'Data program tidak valid.'}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D6B48] text-white rounded-xl text-sm font-semibold hover:bg-[#155438] transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Bantuan
                    </Link>
                </div>
            </div>
        );
    }

    // Format Date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="detail-shell min-h-screen lg:h-screen lg:overflow-hidden bg-[#F1F5F9] font-['Inter'] flex flex-col">
            <style>{`
                .detail-shell { font-family: 'Inter', sans-serif; background: #F1F5F9; display: flex; flex-direction: column; }
                .left-pane-inner { overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
                .left-pane-inner::-webkit-scrollbar { width: 4px; }
                .left-pane-inner::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
                .right-pane { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
                .right-pane::-webkit-scrollbar { width: 4px; }
                .right-pane::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
                .prose-custom h4 { font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-top: 2rem; margin-bottom: 0.75rem; }
                .prose-custom h4:first-child { margin-top: 0; }
                .prose-custom p { color: #475569; line-height: 1.8; font-size: 0.95rem; margin-bottom: 0.875rem; }
                .prose-custom ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.875rem; color: #475569; line-height: 1.8; font-size: 0.95rem; }
                .prose-custom ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.875rem; color: #475569; line-height: 1.8; font-size: 0.95rem; }
            `}</style>

            {/* Breadcrumb */}
            <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3 bg-[#F1F5F9]">
                <nav aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1">
                        <li>
                            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-[#1D6B48] transition-colors">Daftar Bantuan</Link>
                        </li>
                        <li className="flex items-center">
                            <svg className="w-4 h-4 text-gray-300 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            <span className="text-sm font-semibold text-gray-700">Detail Program</span>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Card Body */}
            <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 lg:pb-6 flex flex-col lg:overflow-hidden">
                <div className="bg-white rounded-2xl border border-[#E8EEF4] shadow-sm overflow-hidden flex-1 flex flex-col lg:flex-row lg:overflow-hidden">

                    {/* Left Pane */}
                    <div className="flex-1 min-w-0 flex flex-col lg:overflow-hidden">
                        <div className="left-pane-inner flex-1 p-6 sm:p-8 lg:p-12">
                            {/* Header */}
                            <div className="mb-7">
                                <span className="inline-block px-3 py-1.5 rounded-lg bg-[#EBF7F1] text-[#1D6B48] text-xs font-bold uppercase tracking-widest mb-4 border border-green-100">{program.jenis_program}</span>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">{program.nama_program}</h1>
                                <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    Dipublikasikan pada {formatDate(program.created_at)}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="prose-custom border-t border-gray-100 pt-6">
                                <h4>Deskripsi Program</h4>
                                <div className="mb-5" dangerouslySetInnerHTML={{ __html: program.deskripsi || '<p>Tidak ada deskripsi rinci.</p>' }}></div>

                                {program.ketentuan_umum && (
                                    <div className="border-t border-gray-100 pt-6 mt-4">
                                        <h4>Ketentuan Umum</h4>
                                        <div dangerouslySetInnerHTML={{ __html: program.ketentuan_umum }}></div>
                                    </div>
                                )}
                                
                                {program.jenis_dokumen && program.jenis_dokumen.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6 mt-4">
                                        <h4>Dokumen Persyaratan</h4>
                                        <ul className="mt-2 space-y-1">
                                            {program.jenis_dokumen.map(dok => (
                                                <li key={dok.id}>{dok.nama_dokumen} {dok.wajib && <span className="text-red-500">*</span>} {dok.keterangan && <span className="text-xs text-gray-400 ml-1">({dok.keterangan})</span>}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Pane */}
                    <div className="right-pane w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-[#F1F5F9] bg-[#FAFBFC] p-6 sm:p-8 lg:overflow-y-auto">

                        {/* CTA Block */}
                        <div className={`mb-7 bg-white rounded-xl border relative overflow-hidden ${program.is_open ? 'border-green-100' : 'border-gray-100'}`}>
                            <div className={`absolute top-0 left-0 w-full h-1 ${program.is_open ? 'bg-[#1D6B48]' : 'bg-gray-300'}`}></div>
                            <div className="p-5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Status Pendaftaran</p>
                                {program.is_open ? (
                                    <>
                                        <div className="flex items-center gap-2 text-[#1D6B48] font-extrabold text-lg mb-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B996D] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1D6B48]"></span>
                                            </span>
                                            DIBUKA
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">Segera ajukan pendaftaran sebelum periode berakhir.</p>
                                        <Link to={`/${program.slug}/daftar`} className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#1D6B48] hover:bg-[#155438] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                            Daftar Sekarang
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-red-500 font-extrabold text-lg mb-2">
                                            <span className="inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                                            DITUTUP
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">Periode pendaftaran belum dibuka atau telah berakhir.</p>
                                        <button disabled className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed">
                                            Pendaftaran Ditutup
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        {program.tahapan && program.tahapan.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">Jadwal Pelaksanaan</p>
                                <div className="space-y-5">
                                    {program.tahapan.map(tahap => (
                                        <div key={tahap.id} className="relative pl-6 border-l-2 border-green-100 last:border-transparent group">
                                            <div className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-green-300 group-hover:border-[#1D6B48] transition-colors"></div>
                                            <p className="text-sm font-bold text-gray-800 leading-tight mb-0.5">{tahap.nama_tahap}</p>
                                            <p className="text-xs text-gray-400 font-medium">{formatDate(tahap.tanggal_mulai)} &mdash; {formatDate(tahap.tanggal_selesai)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetail;
