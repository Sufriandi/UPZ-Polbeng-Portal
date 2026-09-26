import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Bell,
    Check,
    Calendar,
    Clock,
    Award,
    Info,
    CheckCheck,
    X,
    ExternalLink,
    BellRing
} from 'lucide-react';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [desktopPermission, setDesktopPermission] = useState(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
    );

    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const initialLoadedRef = useRef(false);
    const latestSeenIdRef = useRef(0);

    // Audio chime menggunakan browser Web Audio API (tanpa file audio eksternal)
    const playNotificationChime = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Nada 1: D5 (587.33 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now);
            gain1.gain.setValueAtTime(0.12, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.18);

            // Nada 2: A5 (880.00 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880.00, now + 0.12);
            gain2.gain.setValueAtTime(0.15, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.45);
        } catch (e) {
            // Audio context mungkin diblokir browser sebelum ada gesture pengguna
        }
    };

    // Minta izin notifikasi desktop/ponsel bawaan
    const requestDesktopPermission = async () => {
        if ('Notification' in window) {
            try {
                const perm = await Notification.requestPermission();
                setDesktopPermission(perm);
                if (perm === 'granted') {
                    new Notification('Pusat Notifikasi Aktif', {
                        body: 'Anda akan menerima pemberitahuan kegiatan & presensi secara real-time.',
                        icon: '/UPZ_polbeng.webp',
                    });
                }
            } catch (e) {
                console.error('Gagal meminta izin notifikasi:', e);
            }
        }
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const triggerNewNotificationAlert = (item) => {
        // 1. Bunyikan audio chime
        playNotificationChime();

        // 2. Munculkan in-app floating toast
        setToasts((prev) => [
            {
                ...item,
                toastId: Date.now() + Math.random(),
            },
            ...prev.slice(0, 2), // maks 3 toast bersamaan
        ]);

        // 3. Picu browser desktop notification jika diizinkan
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                const nativeNotif = new Notification(item.title, {
                    body: item.message,
                    icon: '/UPZ_polbeng.webp',
                });
                nativeNotif.onclick = () => {
                    window.focus();
                    if (item.action_url) {
                        navigate(item.action_url);
                    }
                };
            } catch (e) {
                // Ignore
            }
        }

        // 4. Siarkan event ke komponen lain di SPA agar otomatis sinkronisasi tanpa reload
        if (item.type === 'activity_new') {
            window.dispatchEvent(new CustomEvent('upz:activity_updated', { detail: item }));
        } else if (item.type === 'status_update') {
            window.dispatchEvent(new CustomEvent('upz:status_updated', { detail: item }));
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                const list = res.data.data.notifications || [];
                const unread = res.data.data.unread_count || 0;

                setNotifications(list);
                setUnreadCount(unread);

                if (list.length > 0) {
                    const maxId = Math.max(...list.map((n) => n.id));

                    if (!initialLoadedRef.current) {
                        // Pertama kali dimuat, catat ID terbaru tanpa membunyikan alarm
                        initialLoadedRef.current = true;
                        latestSeenIdRef.current = maxId;
                    } else {
                        // Polling berikutnya: cek apakah ada ID baru yang belum pernah dilihat
                        const newItems = list.filter(
                            (n) => n.id > latestSeenIdRef.current && !n.is_read
                        );

                        if (newItems.length > 0) {
                            newItems.forEach((item) => {
                                triggerNewNotificationAlert(item);
                            });
                            latestSeenIdRef.current = maxId;
                        }
                    }
                } else {
                    initialLoadedRef.current = true;
                }
            }
        } catch (err) {
            // Silently ignore jika belum login / unauthorized
        }
    };

    // Polling real-time adaptif: 3.5 detik saat tab aktif, 20 detik saat di latar belakang
    useEffect(() => {
        fetchNotifications();

        let timer = null;

        const startPolling = () => {
            if (timer) clearInterval(timer);
            const intervalTime = document.visibilityState === 'visible' ? 3500 : 20000;
            timer = setInterval(fetchNotifications, intervalTime);
        };

        startPolling();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications(); // Ambil langsung seketika tab dibuka
            }
            startPolling();
        };

        const handleWindowFocus = () => {
            fetchNotifications();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            if (timer) clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, []);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (id, actionUrl) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Gagal menandai notifikasi dibaca', err);
        }

        setIsOpen(false);
        if (actionUrl) {
            navigate(actionUrl);
        }
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            await api.put('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Gagal menandai semua dibaca', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} jam lalu`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'activity_new':
                return <Calendar className="w-4 h-4 text-emerald-600" />;
            case 'attendance_reminder':
                return <Clock className="w-4 h-4 text-amber-600" />;
            case 'status_update':
                return <Award className="w-4 h-4 text-blue-600" />;
            default:
                return <Info className="w-4 h-4 text-slate-600" />;
        }
    };

    return (
        <>
            {/* FLOATING TOAST NOTIFICATION STACK (REAL-TIME ALERT) */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-32px)] sm:w-96 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.toastId}
                        className="pointer-events-auto bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-top-3 fade-in"
                    >
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
                            {getIcon(toast.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h4 className="text-xs sm:text-sm font-bold text-emerald-300 truncate">
                                    {toast.title}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => removeToast(toast.id)}
                                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {toast.message}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800">
                                <span className="text-[10px] text-slate-400">Baru saja</span>
                                {toast.action_url && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            removeToast(toast.id);
                                            handleMarkAsRead(toast.id, toast.action_url);
                                        }}
                                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
                                    >
                                        <span>Buka</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* BELL BUTTON & DROPDOWN PANEL */}
            <div className="relative" ref={dropdownRef}>
                {/* Bell Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Pusat Notifikasi"
                    aria-label="Pusat Notifikasi"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-500 rounded-full shadow-xs ring-2 ring-white animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown Panel */}
                {isOpen && (
                    <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-[calc(100vw-24px)] sm:w-80 md:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Header */}
                        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-xs sm:text-sm font-bold">Pusat Notifikasi</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                                        {unreadCount} Baru
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="text-[11px] text-emerald-300 hover:text-white transition flex items-center gap-1 cursor-pointer font-semibold disabled:opacity-50"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Tandai Semua Dibaca</span>
                                </button>
                            )}
                        </div>

                        {/* Banner Izin Notifikasi Desktop jika belum aktif */}
                        {desktopPermission === 'default' && (
                            <div className="bg-emerald-50 border-b border-emerald-100 p-2.5 sm:p-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-emerald-900 text-[11px]">
                                    <BellRing className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span>Aktifkan notifikasi desktop agar selalu update?</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={requestDesktopPermission}
                                    className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer flex-shrink-0"
                                >
                                    Izinkan
                                </button>
                            </div>
                        )}

                        {/* List Notifications */}
                        <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                                    <p className="font-semibold text-slate-600">Belum Ada Notifikasi</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Pemberitahuan kegiatan dan status pendaftaran akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleMarkAsRead(item.id, item.action_url)}
                                        className={`p-3.5 sm:p-4 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                                            !item.is_read ? 'bg-emerald-50/40' : ''
                                        }`}
                                    >
                                        <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <h4
                                                    className={`text-xs truncate ${
                                                        !item.is_read
                                                            ? 'font-bold text-slate-900'
                                                            : 'font-semibold text-slate-700'
                                                    }`}
                                                >
                                                    {item.title}
                                                </h4>
                                                {!item.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                {item.message}
                                            </p>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                {formatTimeAgo(item.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationDropdown;

