import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Camera, 
    MapPin, 
    ArrowLeft, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    ShieldCheck, 
    Crosshair,
    Clock
} from 'lucide-react';

const AttendanceLiveCapture = () => {
    const { activityId } = useParams();
    const navigate = useNavigate();

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    // Camera & Geolocation States
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [locating, setLocating] = useState(true);

    // Captured photo state
    const [capturedBlob, setCapturedBlob] = useState(null);
    const [capturedPreview, setCapturedPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadActivity();
        startCamera();
        requestLocation();

        return () => {
            stopCamera();
        };
    }, [activityId]);

    const loadActivity = async () => {
        try {
            const res = await api.get(`/activities/${activityId}`);
            if (res.data.success) {
                setActivity(res.data.data.activity);
                if (res.data.data.attendance) {
                    setSubmitResult({
                        status: res.data.data.attendance.status,
                        alreadyAttended: true,
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load activity', e);
            setError('Gagal memuat jadwal kegiatan.');
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        setCameraError(null);
        try {
            // Wajib Web API getUserMedia live video feed (Anti-manipulasi)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraReady(true);
        } catch (err) {
            console.error('Camera access error:', err);
            setCameraError('Gagal mengakses kamera langsung browser. Pastikan izin kamera telah diberikan.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const requestLocation = () => {
        setLocating(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Perangkat Anda tidak mendukung geolokasi GPS.');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
                setLocating(false);
            },
            (err) => {
                console.error('GPS error:', err);
                setLocationError('Izin akses lokasi GPS ditolak atau tidak akurat. Harap izinkan akses lokasi.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    // Live Snapshot dari elemen <video> ke <canvas> (Mencegah upload dari file galeri)
    const captureSnapshot = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            setCapturedBlob(blob);
            setCapturedPreview(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.9);
    };

    const retakeSnapshot = () => {
        setCapturedBlob(null);
        setCapturedPreview(null);
        setError(null);
    };

    const submitAttendance = async () => {
        if (!capturedBlob || !location) {
            setError('Pastikan foto selfie live dan lokasi GPS telah berhasil didapatkan.');
            return;
        }

        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('activity_id', activity.id);
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('photo', capturedBlob, 'selfie_live.jpg');

        try {
            const res = await api.post('/attendances', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                stopCamera();
                setSubmitResult(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal mengirim absensi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
            </div>
        );
    }

    // Success Screen
    if (submitResult) {
        return (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                        {submitResult.alreadyAttended ? 'Anda Sudah Absen' : 'Absensi Berhasil Dicatat!'}
                    </h2>

                    <div className={`p-4 rounded-2xl text-xs font-bold ${
                        submitResult.status === 'Hadir' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                        Status Kehadiran: <span className="font-extrabold">{submitResult.status}</span>
                        {submitResult.distance_meters && (
                            <div className="mt-1 text-[11px] font-normal text-slate-600">
                                Jarak terhitung: {submitResult.distance_meters} meter (Toleransi: {submitResult.radius_meters}m)
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-400">
                        Timestamp absensi telah direkam menggunakan waktu server resmi.
                    </p>

                    <div className="pt-4 flex flex-col gap-2">
                        <Link
                            to="/attendance/history"
                            className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
                        >
                            Lihat Rekap Kehadiran
                        </Link>
                        <Link
                            to="/activities"
                            className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                        >
                            Kembali ke Jadwal Kegiatan
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <Link
                to="/activities"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Jadwal Kegiatan</span>
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Absensi Anti-Manipulasi
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{activity?.title}</h1>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activity?.location_name} &bull; Radius toleransi: {activity?.radius_meters} meter</span>
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Live Camera Viewfinder or Captured Preview */}
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {cameraError ? (
                        <div className="p-6 text-center text-white space-y-2">
                            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                            <p className="text-xs font-bold">{cameraError}</p>
                            <button
                                onClick={startCamera}
                                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-white transition"
                            >
                                Coba Akses Ulang
                            </button>
                        </div>
                    ) : capturedPreview ? (
                        <img
                            src={capturedPreview}
                            alt="Captured Live"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform -scale-x-100"
                            />
                            {/* Visual Reticle Indicator */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-44 h-56 border-2 border-dashed border-white/50 rounded-3xl" />
                            </div>
                        </>
                    )}
                </div>

                {/* GPS Location Status Indicator */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <Crosshair className={`w-4 h-4 ${location ? 'text-emerald-600' : 'text-slate-400 animate-spin'}`} />
                        <div>
                            {locating ? (
                                <span className="text-slate-500">Mendeteksi lokasi GPS akurat...</span>
                            ) : locationError ? (
                                <span className="text-red-500 font-bold">{locationError}</span>
                            ) : (
                                <span className="font-bold text-slate-800">
                                    GPS Aktif: {location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={requestLocation}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Perbarui GPS"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Camera Capture Actions */}
                <div className="pt-2 flex items-center justify-center gap-4">
                    {capturedPreview ? (
                        <>
                            <button
                                type="button"
                                onClick={retakeSnapshot}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Ambil Ulang Foto
                            </button>
                            <button
                                type="button"
                                disabled={submitting || !location}
                                onClick={submitAttendance}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Konfirmasi &amp; Kirim Absensi</span>
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            disabled={!cameraReady || locating}
                            onClick={captureSnapshot}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                        >
                            <Camera className="w-5 h-5" />
                            <span>Ambil Foto Live Sekarang</span>
                        </button>
                    )}
                </div>

                <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Sistem akan memverifikasi radius lokasi menggunakan formula Haversine server-side dan mencatat timestamp server secara otomatis untuk mencegah kecurangan.
                </div>
            </div>
        </div>
    );
};

export default AttendanceLiveCapture;
