import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Public & Auth Pages
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import ProgramRegistration from './pages/ProgramRegistration';
import Login from './pages/Login';

// Modular Portal Pages
import DashboardRedirect from './pages/DashboardRedirect';
import StatusSeleksi from './pages/applicant/StatusSeleksi';
import BerkasPersyaratan from './pages/applicant/BerkasPersyaratan';
import MonitoringDashboard from './pages/awardee/MonitoringDashboard';
import KegiatanAbsensi from './pages/awardee/KegiatanAbsensi';
import RiwayatKehadiran from './pages/awardee/RiwayatKehadiran';
import ArsipBerkas from './pages/awardee/ArsipBerkas';
import Profile from './pages/Profile';

const AppLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pb-12">
                {children}
            </main>
            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Catalog Routes */}
                    <Route
                        path="/"
                        element={
                            <AppLayout>
                                <Programs />
                            </AppLayout>
                        }
                    />
                    <Route
                        path="/portal"
                        element={
                            <AppLayout>
                                <Programs />
                            </AppLayout>
                        }
                    />

                    {/* Auth & Registration Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/portal/login" element={<Login />} />

                    {/* Program Detail & Direct Registration Routes */}
                    <Route
                        path="/:slug"
                        element={
                            <AppLayout>
                                <ProgramDetail />
                            </AppLayout>
                        }
                    />
                    <Route
                        path="/portal/:slug"
                        element={
                            <AppLayout>
                                <ProgramDetail />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/:slug/daftar"
                        element={
                            <AppLayout>
                                <ProgramRegistration />
                            </AppLayout>
                        }
                    />
                    <Route
                        path="/portal/:slug/daftar"
                        element={
                            <AppLayout>
                                <ProgramRegistration />
                            </AppLayout>
                        }
                    />

                    {/* Protected Portal Dashboard Routes (Nested inside DashboardLayout) */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* Smart Redirectors */}
                        <Route path="/dashboard" element={<DashboardRedirect />} />
                        <Route path="/portal/dashboard" element={<DashboardRedirect />} />

                        {/* Applicant Phase Routes */}
                        <Route path="/status-seleksi" element={<StatusSeleksi />} />
                        <Route path="/portal/status-seleksi" element={<StatusSeleksi />} />
                        <Route path="/berkas" element={<BerkasPersyaratan />} />
                        <Route path="/portal/berkas" element={<BerkasPersyaratan />} />

                        {/* Awardee Phase Routes */}
                        <Route path="/monitoring" element={<MonitoringDashboard />} />
                        <Route path="/portal/monitoring" element={<MonitoringDashboard />} />
                        <Route path="/kehadiran" element={<KegiatanAbsensi />} />
                        <Route path="/portal/kehadiran" element={<KegiatanAbsensi />} />
                        <Route path="/riwayat-kehadiran" element={<RiwayatKehadiran />} />
                        <Route path="/portal/riwayat-kehadiran" element={<RiwayatKehadiran />} />
                        <Route path="/arsip-berkas" element={<ArsipBerkas />} />
                        <Route path="/portal/arsip-berkas" element={<ArsipBerkas />} />

                        {/* Common Profile Routes */}
                        <Route path="/profil" element={<Profile />} />
                        <Route path="/portal/profil" element={<Profile />} />
                    </Route>

                    {/* Catch all fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(<App />);
}

// Register PWA Service Worker
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('PWA service worker registration failed:', err);
        });
    });
}
