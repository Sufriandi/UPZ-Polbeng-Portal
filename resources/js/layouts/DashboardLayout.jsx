import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import NotificationDropdown from '../components/NotificationDropdown';
import PwaInstallPrompt from '../components/PwaInstallPrompt';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    FileCheck,
    FileText,
    User,
    LogOut,
    Menu,
    X,
    Award
} from 'lucide-react';

const DashboardLayout = () => {
    const { pendaftar, program, isLulus, logout, fetchUser } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleStatusUpdate = () => {
            if (fetchUser) fetchUser();
        };
        window.addEventListener('upz:status_updated', handleStatusUpdate);
        return () => window.removeEventListener('upz:status_updated', handleStatusUpdate);
    }, [fetchUser]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = isLulus ? [
        {
            to: '/monitoring',
            label: 'Dashboard Monitoring',
            icon: LayoutDashboard,
        },
        {
            to: '/kehadiran',
            label: 'Jadwal & Absensi',
            icon: Calendar,
        },
        {
            to: '/riwayat-kehadiran',
            label: 'Riwayat Kehadiran',
            icon: Clock,
        },
        {
            to: '/arsip-berkas',
            label: 'Arsip Berkas',
            icon: FileCheck,
        },
        {
            to: '/profil',
            label: 'Profil Saya',
            icon: User,
        },
    ] : [
        {
            to: '/status-seleksi',
            label: 'Status Seleksi',
            icon: LayoutDashboard,
        },
        {
            to: '/berkas',
            label: 'Dokumen Persyaratan',
            icon: FileText,
        },
        {
            to: '/profil',
            label: 'Profil Saya',
            icon: User,
        },
    ];

    if (!pendaftar) return null;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Mobile Hamburger Button */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden inline-flex items-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer mr-1"
                            >
                                <span className="sr-only">Buka menu utama</span>
                                {!sidebarOpen ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
                            </button>

                            {/* Brand Header */}
                            <div className="flex items-center space-x-2">
                                <img src="/UPZ_polbeng.webp" alt="Logo UPZ" className="h-7 sm:h-8 w-auto" />
                                <div className="flex flex-col justify-center">
                                    <span className="text-base sm:text-xl font-bold text-[#3B996D] leading-none">
                                        UPZ Polbeng
                                    </span>
                                    {program && (
                                        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                                            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 truncate max-w-[120px] sm:max-w-none">
                                                {program.nama_program}
                                            </span>
                                            {isLulus && (
                                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                                    Penerima Aktif
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notification & User Profile & Logout */}
                        <div className="flex items-center space-x-1.5 sm:space-x-3">
                            <NotificationDropdown />
                            <div className="flex items-center space-x-2 sm:space-x-3 border-l border-r border-gray-100 px-2 sm:px-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3B996D]/10 text-[#3B996D] flex items-center justify-center font-bold text-xs sm:text-sm">
                                    {pendaftar.nama ? pendaftar.nama.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="hidden sm:flex flex-col text-left">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                                        {pendaftar.nama}
                                    </span>
                                    <span className="text-[10px] text-gray-500 leading-tight">{pendaftar.email}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer gap-1 sm:gap-1.5"
                                title="Keluar Akun"
                            >
                                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Wrapper: Sidebar (Desktop Sticky) + Content Column */}
            <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
                {/* Mobile Drawer Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Component */}
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex-shrink-0 flex flex-col justify-between ${
                        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                    }`}
                >
                    <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
                        {/* Mobile Drawer Header */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 lg:hidden">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Menu Portal
                            </span>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `w-full flex items-center px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 gap-3 cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#3B996D] text-white shadow-xs'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                                                        isActive ? 'scale-105' : 'text-gray-400'
                                                    }`}
                                                />
                                                <span className="truncate">{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    {/* PWA Mobile Install Prompt */}
                    <PwaInstallPrompt />

                    {/* Footer Badge di Sidebar */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Award className="w-4 h-4 text-[#3B996D]" />
                            <span className="text-[11px] font-medium truncate">
                                {isLulus ? 'Penerima Beasiswa UPZ' : 'Calon Penerima Beasiswa'}
                            </span>
                        </div>
                    </div>
                </aside>

                {/* Right Content Column + Footer */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <main className="p-3 sm:p-5 lg:p-8 flex-1">
                        <Outlet />
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
