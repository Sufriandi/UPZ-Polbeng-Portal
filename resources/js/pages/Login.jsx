import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan pada server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row lg:overflow-hidden bg-white lg:bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            {/* Left Panel */}
            <div className="w-full lg:w-5/12 bg-[#1a5c3e] flex-shrink-0 flex flex-col justify-between p-8 sm:p-12 lg:p-14 xl:p-16 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-56 h-56 lg:w-80 lg:h-80 rounded-full bg-white/5"></div>
                <div className="absolute -bottom-32 -left-16 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-white/5"></div>

                <div className="relative z-10">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3 lg:mb-4">Portal Bantuan</p>
                    <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight mb-4 lg:mb-5">Selamat Datang Kembali</h1>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-lg">
                        Masuk ke akun Anda untuk memantau status pendaftaran, melengkapi dokumen, dan menerima pengumuman terbaru.
                    </p>
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="flex-1 bg-white flex flex-col justify-center px-6 py-10 sm:p-12 lg:p-16 xl:p-24 lg:overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                <div className="w-full max-w-md mx-auto">
                    
                    <div className="mb-8 lg:mb-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Masuk Akun</h2>
                        <p className="text-gray-500 text-sm sm:text-base">Masukkan kredensial Anda untuk melanjutkan.</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 sm:py-3.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                placeholder="contoh@email.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Kata Sandi</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 sm:py-3.5 pr-11 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5c3e] focus:bg-white focus:border-transparent transition-all"
                                    placeholder="Masukkan sandi"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {showPassword ? (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                            </>
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#1a5c3e] hover:bg-[#134a31] text-white text-[15px] font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                                {!loading && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
