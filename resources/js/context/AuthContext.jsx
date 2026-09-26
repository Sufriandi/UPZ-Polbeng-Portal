import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [pendaftar, setPendaftar] = useState(null);
    const [program, setProgram] = useState(null);
    const [pendaftaran, setPendaftaran] = useState(null);
    const [isLulus, setIsLulus] = useState(false);
    const [status, setStatus] = useState('Belum Mendaftar');
    const [token, setToken] = useState(localStorage.getItem('portal_token') || null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        if (!localStorage.getItem('portal_token')) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                const data = res.data.data;
                setPendaftar(data.pendaftar);
                setProgram(data.program);
                setPendaftaran(data.pendaftaran);
                setIsLulus(data.is_lulus);
                setStatus(data.status);
                localStorage.setItem('portal_pendaftar', JSON.stringify(data.pendaftar));
            }
        } catch (err) {
            console.error('Gagal memuat profil pendaftar:', err);
            localStorage.removeItem('portal_token');
            localStorage.removeItem('portal_pendaftar');
            setPendaftar(null);
            setProgram(null);
            setPendaftaran(null);
            setIsLulus(false);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                const receivedToken = res.data.data.token;
                const receivedPendaftar = res.data.data.pendaftar;
                const receivedProgram = res.data.data.program;

                localStorage.setItem('portal_token', receivedToken);
                localStorage.setItem('portal_pendaftar', JSON.stringify(receivedPendaftar));

                setToken(receivedToken);
                setPendaftar(receivedPendaftar);
                setProgram(receivedProgram);

                await fetchUser();
                return res.data;
            }
            throw new Error(res.data.message || 'Login gagal.');
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || 'Login gagal.');
        }
    };

    const registerForProgram = async (slug, payload) => {
        const res = await api.post(`/auth/register/${slug}`, payload);
        if (res.data.success) {
            const receivedToken = res.data.data.token;
            const receivedPendaftar = res.data.data.pendaftar;
            const receivedProgram = res.data.data.program;

            localStorage.setItem('portal_token', receivedToken);
            localStorage.setItem('portal_pendaftar', JSON.stringify(receivedPendaftar));

            setToken(receivedToken);
            setPendaftar(receivedPendaftar);
            setProgram(receivedProgram);

            await fetchUser();
            return res.data;
        }
        throw new Error(res.data.message || 'Registrasi gagal.');
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            // Abaikan error pada panggilan logout
        } finally {
            localStorage.removeItem('portal_token');
            localStorage.removeItem('portal_pendaftar');
            setToken(null);
            setPendaftar(null);
            setProgram(null);
            setPendaftaran(null);
            setIsLulus(false);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: pendaftar, // alias untuk kompatibilitas
                pendaftar,
                program,
                pendaftaran,
                isLulus,
                status,
                token,
                loading,
                login,
                registerForProgram,
                logout,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
