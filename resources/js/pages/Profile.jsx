import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, CheckCircle2, AlertCircle, Save, Lock } from 'lucide-react';

const Profile = () => {
    const { pendaftar, fetchUser } = useAuth();

    const [profilNama, setProfilNama] = useState(pendaftar?.nama || '');
    const [profilNoHp, setProfilNoHp] = useState(pendaftar?.no_hp || '');
    const [profilPassword, setProfilPassword] = useState('');
    const [profilPasswordConfirmation, setProfilPasswordConfirmation] = useState('');
    const [profilMsg, setProfilMsg] = useState(null);
    const [profilLoading, setProfilLoading] = useState(false);

    useEffect(() => {
        if (pendaftar) {
            setProfilNama(pendaftar.nama || '');
            setProfilNoHp(pendaftar.no_hp || '');
        }
    }, [pendaftar]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfilLoading(true);
        setProfilMsg(null);

        try {
            const payload = {
                nama: profilNama,
                no_hp: profilNoHp,
            };
            if (profilPassword) {
                payload.password = profilPassword;
                payload.password_confirmation = profilPasswordConfirmation;
            }

            const res = await api.put('/auth/profile', payload);
            if (res.data.success) {
                setProfilMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
                setProfilPassword('');
                setProfilPasswordConfirmation('');
                await fetchUser();
            }
        } catch (err) {
            setProfilMsg({
                type: 'error',
                text: err.response?.data?.message || 'Gagal memperbarui profil.',
            });
        } finally {
            setProfilLoading(false);
        }
    };

    if (!pendaftar) return null;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    Pengaturan Profil Akun
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Perbarui nama lengkap, nomor HP aktif, dan kata sandi akun Anda.
                </p>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-gray-100 flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900">Informasi Akun</h2>
                        <p className="text-[11px] sm:text-xs text-gray-500">Kelola identitas diri dan kredensial login Anda</p>
                    </div>
                </div>

                {profilMsg && (
                    <div
                        className={`mx-4 mt-4 sm:mx-6 sm:mt-6 p-3 sm:p-4 rounded-lg border text-xs sm:text-sm flex items-center gap-2.5 ${
                            profilMsg.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                    >
                        {profilMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        )}
                        <span>{profilMsg.text}</span>
                    </div>
                )}

                <form onSubmit={handleProfileUpdate} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                value={profilNama}
                                onChange={(e) => setProfilNama(e.target.value)}
                                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-white border border-gray-300 text-xs sm:text-sm focus:border-[#3B996D] focus:ring-4 focus:ring-[#3B996D]/15 outline-none transition-all shadow-xs"
                            />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">Nomor HP / WhatsApp</label>
                            <input
                                type="text"
                                value={profilNoHp}
                                onChange={(e) => setProfilNoHp(e.target.value)}
                                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-white border border-gray-300 text-xs sm:text-sm focus:border-[#3B996D] focus:ring-4 focus:ring-[#3B996D]/15 outline-none transition-all shadow-xs"
                            />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                                Alamat Email{' '}
                                <span className="text-[11px] sm:text-xs text-gray-400 font-normal ml-1">
                                    (Tidak dapat diubah)
                                </span>
                            </label>
                            <input
                                type="email"
                                disabled
                                value={pendaftar?.email || ''}
                                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-500 cursor-not-allowed outline-none shadow-xs"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 sm:pt-6 mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900">Ubah Kata Sandi (Opsional)</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                                    Kata Sandi Baru
                                </label>
                                <input
                                    type="password"
                                    placeholder="Biarkan kosong jika tidak diubah"
                                    value={profilPassword}
                                    onChange={(e) => setProfilPassword(e.target.value)}
                                    className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-white border border-gray-300 text-xs sm:text-sm focus:border-[#3B996D] focus:ring-4 focus:ring-[#3B996D]/15 outline-none transition-all shadow-xs"
                                />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                                    Konfirmasi Kata Sandi Baru
                                </label>
                                <input
                                    type="password"
                                    placeholder="Ketik ulang kata sandi baru"
                                    value={profilPasswordConfirmation}
                                    onChange={(e) => setProfilPasswordConfirmation(e.target.value)}
                                    className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-white border border-gray-300 text-xs sm:text-sm focus:border-[#3B996D] focus:ring-4 focus:ring-[#3B996D]/15 outline-none transition-all shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={profilLoading}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 bg-[#3B996D] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#2e7d58] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
                        >
                            {profilLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
