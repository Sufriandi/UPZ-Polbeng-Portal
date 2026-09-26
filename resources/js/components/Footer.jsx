import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 mt-auto py-3.5 sm:py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-center sm:text-left">
                <div className="text-[11px] sm:text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} <strong>UPZ Politeknik Negeri Bengkalis</strong>. Seluruh hak cipta dilindungi.
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400">
                    <span>Versi 1.0</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
