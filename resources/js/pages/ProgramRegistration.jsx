import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

const ProgramRegistration = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { registerForProgram } = useAuth();

    const [program, setProgram] = useState(null);
    const [loadingProgram, setLoadingProgram] = useState(true);
    const [programError, setProgramError] = useState(null);

    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        no_hp: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const res = await api.get(`/programs/${slug}`);
                if (res.data.success) {
                    setProgram(res.data.data);
                    if (!res.data.data.is_open) {
                        setProgramError('Periode pendaftaran untuk program ini belum dibuka atau sudah berakhir.');
                    }
                }
            } catch (err) {
                setProgramError('Program beasiswa tidak ditemukan atau sudah tidak aktif.');
            } finally {
                setLoadingProgram(false);
            }
        };

        fetchProgram();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setFieldErrors({});

        if (formData.password !== formData.password_confirmation) {
            setFieldErrors({ password_confirmation: ['Konfirmasi kata sandi tidak cocok.'] });
            return;
        }

        setSubmitting(true);

        try {
            await registerForProgram(slug, formData);
            // Sukses terdaftar dan langsung login
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 422 && err.response.data.errors) {
                setFieldErrors(err.response.data.errors);
                setErrorMsg(err.response.data.message || 'Mohon periksa kembali isian formulir.');
            } else if (err.response && err.response.data.message) {
                setErrorMsg(err.response.data.message);
            } else {
                setErrorMsg(err.message || 'Terjadi kesalahan pada sistem. Silakan coba lagi.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingProgram) {
        return (
            <div className="min-h-screen bg-white lg:bg-[#F8FAFC] flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-[#1a5c3e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (programError || !program) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Pendaftaran Tidak Tersedia</h2>
                    <p className="text-sm text-gray-600 mb-6">{programError || 'Program tidak dapat didaftar.'}</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a5c3e] text-white rounded-xl text-sm font-semibold hover:bg-[#134a31] transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                        Pilih Program Lain
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row lg:overflow-hidden bg-white lg:bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Left Panel (Header on Mobile, Sidebar on Desktop) */}
            <div className="w-full lg:w-5/12 bg-[#1a5c3e] flex-shrink-0 flex flex-col justify-between p-8 sm:p-12 lg:p-14 xl:p-16 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-56 h-56 lg:w-80 lg:h-80 rounded-full bg-white/5"></div>
                <div className="absolute -bottom-32 -left-16 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-white/5"></div>

                <div className="relative z-10">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3 lg:mb-4">Registrasi Pendaftar</p>
                    <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight mb-4 lg:mb-5">{program.nama_program}</h1>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-lg">
                        Silakan lengkapi data diri Anda di formulir pendaftaran. Pastikan alamat email dan nomor telepon (WhatsApp) Anda aktif.
                    </p>
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="flex-1 bg-white flex flex-col justify-center px-6 py-10 sm:p-12 lg:p-16 xl:p-24 lg:overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                <div className="w-full max-w-md mx-auto">
                    
                    <div className="mb-8 lg:mb-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h2>
                        <p className="text-gray-500 text-sm sm:text-base">Masukan informasi dasar untuk memulai pendaftaran.</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            <div>{errorMsg}</div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Nama Lengkap</label>
                            <input name="nama" type="text" required value={formData.nama} onChange={handleChange}
                                className="w-full px-4 py-3 sm:py-3.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                placeholder="Sesuai KTP / identitas resmi" />
                            {fieldErrors.nama && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.nama[0]}</p>}
                        </div>

                        {/* Email & WhatsApp */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    className="w-full px-4 py-3 sm:py-3.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                    placeholder="contoh@email.com" />
                                {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.email[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">WhatsApp</label>
                                <input name="no_hp" type="text" required value={formData.no_hp} onChange={handleChange}
                                    className="w-full px-4 py-3 sm:py-3.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                    placeholder="08xxxxxxxxxx" />
                                {fieldErrors.no_hp && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.no_hp[0]}</p>}
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Kata Sandi</label>
                                <div className="relative">
                                    <input name="password" type={showPassword ? 'text' : 'password'} required minLength={8} value={formData.password} onChange={handleChange}
                                        className="w-full px-4 py-3 sm:py-3.5 pr-11 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                        placeholder="Min. 8 karakter" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.password[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Konfirmasi</label>
                                <div className="relative">
                                    <input name="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} required minLength={8} value={formData.password_confirmation} onChange={handleChange}
                                        className="w-full px-4 py-3 sm:py-3.5 pr-11 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                        placeholder="Ulangi sandi" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.password_confirmation && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.password_confirmation[0]}</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-3">
                            <button type="submit" disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#1a5c3e] hover:bg-[#134a31] text-white text-[15px] font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60">
                                {submitting ? 'Memproses...' : 'Daftar Akun Sekarang'}
                                {!submitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Sudah punya akun?
                        <Link to="/login" className="font-bold text-[#1a5c3e] hover:underline ml-1">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProgramRegistration;
