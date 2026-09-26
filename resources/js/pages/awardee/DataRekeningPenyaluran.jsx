import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Clock,
    Upload,
    Building2,
    ArrowDownRight,
    Lock,
    ExternalLink,
    Wallet
} from 'lucide-react';

const DataRekeningPenyaluran = () => {
    const { isLulus, hasFeatureAccess } = useAuth();

    // State Rekening
    const [bankAccount, setBankAccount] = useState({
        bank_name: '',
        account_number: '',
        account_holder_name: '',
        passbook_file_url: null,
        is_verified: false,
        verified_by: null,
        verified_at: null,
    });
    const [passbookFile, setPassbookFile] = useState(null);
    const [savingAccount, setSavingAccount] = useState(false);
    const [accountMsg, setAccountMsg] = useState({ type: '', text: '' });

    // State Penyaluran
    const [disbursements, setDisbursements] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [loading, setLoading] = useState(true);

    if (!isLulus) {
        return <Navigate to="/status-seleksi" replace />;
    }

    const isFeatureAllowed = hasFeatureAccess('disbursement_info');

    const fetchData = async () => {
        if (!isFeatureAllowed) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Ambil data rekening bank
            const bankRes = await api.get('/bank-account');
            if (bankRes.data.success && bankRes.data.data) {
                setBankAccount(bankRes.data.data);
            }

            // Ambil data riwayat penyaluran dari kas penyalurans
            const disbRes = await api.get('/disbursements');
            if (disbRes.data.success) {
                setDisbursements(disbRes.data.data.disbursements || []);
                setTotalReceived(disbRes.data.data.total_received || 0);
            }
        } catch (err) {
            console.error('Gagal mengambil data rekening & penyaluran:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isFeatureAllowed]);

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        setSavingAccount(true);
        setAccountMsg({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('bank_name', bankAccount.bank_name);
            formData.append('account_number', bankAccount.account_number);
            formData.append('account_holder_name', bankAccount.account_holder_name);
            if (passbookFile) {
                formData.append('passbook_file', passbookFile);
            }

            const res = await api.post('/bank-account', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setBankAccount(res.data.data);
                setPassbookFile(null);
                setAccountMsg({
                    type: 'success',
                    text: 'Data nomor rekening berhasil disimpan!',
                });
            }
        } catch (err) {
            setAccountMsg({
                type: 'error',
                text: err.response?.data?.message || 'Gagal menyimpan data rekening.',
            });
        } finally {
            setSavingAccount(false);
        }
    };

    // Tampilan jika email mahasiswa belum diberi akses oleh Super Admin
    if (!isFeatureAllowed) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        Fitur Terbatas (Early Access)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Laman <strong>Data Rekening & Riwayat Penyaluran</strong> saat ini berada dalam tahap pembatasan akses. Akses hanya dapat dibuka oleh <strong>Super Admin UPZ Polbeng</strong>.
                    </p>
                    <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            Silakan hubungi administrator UPZ untuk mengaktifkan akses fitur ini.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400 text-xs sm:text-sm">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                Memuat data rekening dan penyaluran bantuan...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Laman */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                            Data Rekening & Informasi Penyaluran
                        </h1>
                        <p className="text-xs text-slate-500">
                            Kelola nomor rekening bank pencairan beasiswa dan pantau catatan penyaluran dana
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        Early Access Aktif
                    </span>
                </div>
            </div>

            {/* Stat Ringkasan Penyaluran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-5 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-100 block mb-1">
                        Total Bantuan Disalurkan
                    </span>
                    <div className="text-2xl sm:text-3xl font-black">
                        Rp {totalReceived.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[11px] text-emerald-200 mt-2 block">
                        Tercatat pada buku kas penyaluran resmi UPZ Polbeng
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1">
                            Frekuensi Penyaluran
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900">
                            {disbursements.length} <span className="text-sm font-normal text-slate-500">Kali Pencairan</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Penyaluran terakhir: {disbursements.length > 0 ? new Date(disbursements[0].tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum ada'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Rekening Bank (Col 5) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-sm font-bold text-slate-900">Rekening Bank Pencairan</h2>
                        </div>
                        {bankAccount.is_verified ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Menunggu Validasi
                            </span>
                        )}
                    </div>

                    {accountMsg.text && (
                        <div
                            className={`p-3 rounded-xl text-xs font-medium ${
                                accountMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                        >
                            {accountMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                                Nama Bank
                            </label>
                            <select
                                value={bankAccount.bank_name || ''}
                                onChange={(e) => setBankAccount({ ...bankAccount, bank_name: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900 font-medium"
                            >
                                <option value="">-- Pilih Bank --</option>
                                <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                                <option value="Bank Riau Kepri Syariah">Bank Riau Kepri Syariah (BRK Syariah)</option>
                                <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                                <option value="Bank Mandiri">Bank Mandiri</option>
                                <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                                <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                                <option value="Bank Tabungan Negara (BTN)">Bank Tabungan Negara (BTN)</option>
                                <option value="Bank Lainnya">Bank Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                                Nomor Rekening
                            </label>
                            <input
                                type="text"
                                value={bankAccount.account_number || ''}
                                onChange={(e) => setBankAccount({ ...bankAccount, account_number: e.target.value })}
                                required
                                placeholder="Contoh: 1234567890"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-bold"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                                Nama Pemilik Rekening (Sesuai Buku)
                            </label>
                            <input
                                type="text"
                                value={bankAccount.account_holder_name || ''}
                                onChange={(e) => setBankAccount({ ...bankAccount, account_holder_name: e.target.value })}
                                required
                                placeholder="Nama lengkap mahasiswa"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-medium"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Pastikan atas nama rekening sama dengan nama mahasiswa yang terdaftar.
                            </p>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                                Foto Halaman Depan Buku Tabungan (Opsional)
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={(e) => setPassbookFile(e.target.files[0])}
                                className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                            />
                            {bankAccount.passbook_file_url && (
                                <a
                                    href={bankAccount.passbook_file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-1 font-semibold"
                                >
                                    <span>Lihat file yang tersimpan</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={savingAccount}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50 mt-2"
                        >
                            {savingAccount ? 'Menyimpan...' : 'Simpan Data Rekening'}
                        </button>
                    </form>
                </div>

                {/* Tabel Riwayat Penyaluran (Col 7) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-sm font-bold text-slate-900">Riwayat Penyaluran Dana Beasiswa</h2>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold">
                            {disbursements.length} Transaksi
                        </span>
                    </div>

                    {disbursements.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                            <p className="font-semibold text-slate-600">Belum Ada Catatan Penyaluran</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Riwayat transfer atau pencairan dana dari bendahara UPZ akan tampil di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                                        <th className="py-2.5 px-3">Tanggal</th>
                                        <th className="py-2.5 px-3">Keterangan / Kegiatan</th>
                                        <th className="py-2.5 px-3">Metode</th>
                                        <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {disbursements.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-3 px-3 text-slate-800">
                                                <div className="font-bold">{item.kegiatan || 'Penyaluran Bantuan Mahasiswa'}</div>
                                                <div className="text-[10px] text-slate-400">Penerima: {item.nama_penerima}</div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                                    {item.metode_penyaluran || 'Transfer'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-black text-emerald-600 whitespace-nowrap">
                                                Rp {parseFloat(item.jumlah).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataRekeningPenyaluran;
