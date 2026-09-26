import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
    ArrowLeft, 
    ArrowRight, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Building2,
    ShieldCheck
} from 'lucide-react';

const ApplicationForm = () => {
    const { programId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Multi-step: 1 = Profil, 2 = Upload Berkas, 3 = Konfirmasi
    const [step, setStep] = useState(1);

    // Form inputs
    const [profileData, setProfileData] = useState({
        full_name: '',
        nim: '',
        jurusan: '',
        prodi: '',
        semester: '',
        phone: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
    });

    const [documents, setDocuments] = useState({}); // key: reqId, value: File

    useEffect(() => {
        loadData();
    }, [programId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/programs/${programId}`);
            if (res.data.success) {
                setProgram(res.data.data);
            }

            if (user) {
                setProfileData({
                    full_name: user.name || '',
                    nim: user.nim || '',
                    jurusan: user.student_profile?.jurusan || '',
                    prodi: user.student_profile?.prodi || '',
                    semester: user.student_profile?.semester || '',
                    phone: user.student_profile?.phone || '',
                    bank_name: user.student_profile?.bank_name || '',
                    bank_account_number: user.student_profile?.bank_account_number || '',
                    bank_account_name: user.student_profile?.bank_account_name || user.name || '',
                });
            }
        } catch (e) {
            console.error(e);
            setError('Gagal memuat detail program.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (reqId, file) => {
        if (!file) return;

        // Validasi ukuran maks 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal adalah 5MB.');
            return;
        }

        setDocuments(prev => ({ ...prev, [reqId]: file }));
    };

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            // Update profile first if any fields were modified
            await api.put('/auth/profile', profileData);

            // Construct multipart FormData for application
            const formData = new FormData();
            formData.append('assistance_program_id', program.id);

            Object.entries(documents).forEach(([reqId, file]) => {
                formData.append(`documents[${reqId}]`, file);
            });

            const res = await api.post('/applications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                navigate(`/applications/${res.data.data.id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal mengirimkan pendaftaran.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
            </div>
        );
    }

    if (!program) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <Link
                to={`/programs/${program.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Batal &amp; Kembali ke Detail Program</span>
            </Link>

            {/* Stepper Progress */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold">
                {[
                    { s: 1, label: '1. Data Diri & Akademik' },
                    { s: 2, label: '2. Unggah Dokumen' },
                    { s: 3, label: '3. Konfirmasi & Kirim' },
                ].map(({ s, label }) => (
                    <div 
                        key={s} 
                        className={`flex items-center gap-1.5 ${
                            step === s ? 'text-emerald-700 font-extrabold' : step > s ? 'text-slate-700' : 'text-slate-400'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                            step === s ? 'bg-emerald-600 text-white' : step > s ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                            {s}
                        </div>
                        <span className="hidden sm:inline">{label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form Steps Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                {/* Step 1: Profil Mahasiswa */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-extrabold text-slate-900">Langkah 1: Verifikasi Data Mahasiswa</h2>
                            <p className="text-xs text-slate-500 mt-1">Pastikan data akademik Anda sudah mutakhir dan sesuai dengan SIAKAD.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">NIM</label>
                                <input
                                    type="text"
                                    disabled
                                    value={profileData.nim}
                                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Jurusan</label>
                                <input
                                    type="text"
                                    value={profileData.jurusan}
                                    onChange={(e) => setProfileData({ ...profileData, jurusan: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Program Studi</label>
                                <input
                                    type="text"
                                    value={profileData.prodi}
                                    onChange={(e) => setProfileData({ ...profileData, prodi: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Semester Saat Ini</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="14"
                                    value={profileData.semester}
                                    onChange={(e) => setProfileData({ ...profileData, semester: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">No. WhatsApp</label>
                                <input
                                    type="text"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                            >
                                <span>Lanjut: Unggah Dokumen</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload Dokumen */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-extrabold text-slate-900">Langkah 2: Unggah Berkas Persyaratan</h2>
                            <p className="text-xs text-slate-500 mt-1">Unggah dokumen berformat PDF atau JPG/PNG dengan batas maksimal 5MB per file.</p>
                        </div>

                        <div className="space-y-4">
                            {program.requirements?.map((req) => {
                                const file = documents[req.id];
                                return (
                                    <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-extrabold text-slate-800">
                                                {req.document_name}
                                                {req.is_required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <span className="text-[10px] text-slate-400">
                                                Maks: {Math.round((req.max_size_kb || 5120) / 1024)}MB
                                            </span>
                                        </div>
                                        {req.description && (
                                            <p className="text-[11px] text-slate-500">{req.description}</p>
                                        )}

                                        <div className="mt-2 flex items-center gap-3">
                                            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition">
                                                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{file ? 'Ganti Berkas' : 'Pilih File'}</span>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(req.id, e.target.files[0])}
                                                />
                                            </label>

                                            {file ? (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                    <span className="text-[10px] text-emerald-500 font-normal">({(file.size / 1024).toFixed(0)} KB)</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Belum ada file dipilih</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                &larr; Kembali ke Data Diri
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    // Cek apakah dokumen wajib sudah ada
                                    for (let r of (program.requirements || [])) {
                                        if (r.is_required && !documents[r.id]) {
                                            alert(`Dokumen wajib "${r.document_name}" belum diunggah.`);
                                            return;
                                        }
                                    }
                                    setStep(3);
                                }}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                            >
                                <span>Lanjut: Konfirmasi</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Konfirmasi & Kirim */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-extrabold text-slate-900">Langkah 3: Tinjau &amp; Kirim Pengajuan</h2>
                            <p className="text-xs text-slate-500 mt-1">Periksa kembali data dan berkas yang akan diajukan ke tim seleksi UPZ Polbeng.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                            <div className="font-bold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                Pernyataan Integritas Mahasiswa
                            </div>
                            <p className="leading-relaxed">
                                Dengan mengirimkan permohonan ini, saya menyatakan bahwa seluruh data dan dokumen yang saya lampirkan adalah benar, sah, dan dapat dipertanggungjawabkan sesuai ketentuan UPZ Polbeng.
                            </p>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-semibold">Program:</span>
                                <span className="font-extrabold text-slate-800">{program.name}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-semibold">Nama Mahasiswa:</span>
                                <span className="font-bold text-slate-800">{profileData.full_name} ({profileData.nim})</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-semibold">Jurusan / Prodi:</span>
                                <span className="font-bold text-slate-800">{profileData.jurusan} / {profileData.prodi}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-semibold">Dokumen Dilampirkan:</span>
                                <span className="font-bold text-emerald-700">{Object.keys(documents).length} Dokumen Berkas</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setStep(2)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                &larr; Ubah Dokumen
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Kirim Pendaftaran Resmi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationForm;
