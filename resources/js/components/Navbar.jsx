import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { pendaftar } = useAuth();
    const location = useLocation();

    // In backend, navbar is hidden on register, login, and dashboard routes.
    // Dashboard has its own navbar in dashboard.blade.php.
    if (
        location.pathname === '/login' ||
        location.pathname === '/dashboard' ||
        location.pathname.endsWith('/daftar') ||
        location.pathname.includes('/dashboard/')
    ) {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                                <img src="/UPZ_polbeng.webp" alt="UPZ Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-gray-900 tracking-tight hidden sm:block">
                                UPZ <span className="text-[#3B996D]">Polbeng</span>
                            </span>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                    isActive('/')
                                        ? 'border-[#3B996D] text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Pendaftaran Bantuan
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {pendaftar ? (
                            <Link
                                to="/dashboard"
                                className="text-sm font-semibold text-gray-600 hover:text-[#3B996D] transition-colors"
                            >
                                Dashboard Saya
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1D6B48] hover:bg-[#155438] transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
