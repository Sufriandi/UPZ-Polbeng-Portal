import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

const PwaInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Cek jika sudah standalone/installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
    };

    if (isInstalled || isDismissed || !deferredPrompt) {
        return null;
    }

    return (
        <div className="mx-3 my-2 p-3 bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-xl shadow-md border border-emerald-600/40 relative animate-in fade-in duration-300">
            <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="absolute top-2 right-2 text-emerald-200 hover:text-white p-1 rounded-md cursor-pointer"
                title="Tutup pesan"
            >
                <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-2.5 pr-5">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h4 className="text-xs font-bold leading-tight">Pasang Aplikasi di Layar HP</h4>
                    <p className="text-[10px] text-emerald-100 mt-0.5 leading-relaxed">
                        Akses portal lebih cepat dan stabil tanpa membuka browser secara manual.
                    </p>
                    <button
                        type="button"
                        onClick={handleInstallClick}
                        className="mt-2 w-full py-1.5 px-3 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pasang Sekarang</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PwaInstallPrompt;
