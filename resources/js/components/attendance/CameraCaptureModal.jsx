import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { X, Check, Camera, RefreshCw } from 'lucide-react';

const CameraCaptureModal = ({ isOpen, onClose, activity, onSuccess }) => {
    const [cameraStarting, setCameraStarting] = useState(false);
    const [videoStream, setVideoStream] = useState(null);
    const [snapshotBase64, setSnapshotBase64] = useState(null);
    const [currentCoords, setCurrentCoords] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [submittingAttendance, setSubmittingAttendance] = useState(false);
    const [attendanceSuccess, setAttendanceSuccess] = useState(null);
    const [attendanceError, setAttendanceError] = useState(null);
    const [facingMode, setFacingMode] = useState('user');

    // Face Detection States
    const [faceDetected, setFaceDetected] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [hasNativeDetector, setHasNativeDetector] = useState(false);
    const faceDetectionRef = useRef(null);
    const nativeDetectorRef = useRef(null);
    const faceModelRef = useRef(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const snapshotRef = useRef(null);
    const streamRef = useRef(null);

    // Preload model on mount
    useEffect(() => {
        if ('FaceDetector' in window) {
            nativeDetectorRef.current = new window.FaceDetector({ maxDetectedFaces: 1 });
            setHasNativeDetector(true);
        } else {
            const preloadModel = async () => {
                try {
                    await tf.setBackend('webgl');
                    const model = await blazeface.load();
                    faceModelRef.current = model;
                } catch (e) {
                    console.warn("Background TFJS load failed:", e);
                }
            };
            preloadModel();
        }
    }, []);

    // Initialize camera and geolocation when modal opens
    useEffect(() => {
        if (isOpen && activity) {
            setSnapshotBase64(null);
            setAttendanceSuccess(null);
            setAttendanceError(null);
            setCurrentCoords(null);
            setGeoError(null);
            setFacingMode('user');

            // Geolocation
            setGeoLoading(true);
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setCurrentCoords({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                        });
                        setGeoLoading(false);
                    },
                    (err) => {
                        setGeoError('Izin akses lokasi (GPS) ditolak atau tidak tersedia. Aktifkan GPS untuk absensi.');
                        setGeoLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                setGeoError('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
                setGeoLoading(false);
            }

            startCamera('user');
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, activity]);

    useEffect(() => {
        snapshotRef.current = snapshotBase64;
    }, [snapshotBase64]);

    useEffect(() => {
        streamRef.current = videoStream;
        if (videoRef.current && videoStream && videoRef.current.srcObject !== videoStream) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.play().catch(() => {});
        }
    }, [videoStream]);

    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach((track) => track.stop());
            setVideoStream(null);
            streamRef.current = null;
        }
        if (faceDetectionRef.current) {
            cancelAnimationFrame(faceDetectionRef.current);
            faceDetectionRef.current = null;
        }
    };

    const drawFaceBox = (faces, videoEl) => {
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        const cvs = overlayRef.current;

        if (cvs.width !== videoEl.videoWidth) {
            cvs.width = videoEl.videoWidth;
            cvs.height = videoEl.videoHeight;
        }

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        if (!faces || faces.length === 0) return;

        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;

        faces.forEach(face => {
            let x, y, w, h;
            if (face.boundingBox) {
                x = face.boundingBox.x;
                y = face.boundingBox.y;
                w = face.boundingBox.width;
                h = face.boundingBox.height;
            } else if (face.topLeft && face.bottomRight) {
                x = face.topLeft[0];
                y = face.topLeft[1];
                w = face.bottomRight[0] - x;
                h = face.bottomRight[1] - y;
            }

            if (facingMode === 'user') {
                x = cvs.width - x - w;
            }

            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 12);
            ctx.stroke();
        });
    };

    const startCamera = async (mode = facingMode) => {
        stopCamera();
        setAttendanceError(null);
        setFaceDetected(false);
        setIsDetecting(true);
        setCameraStarting(true);

        if (overlayRef.current) {
            const ctx = overlayRef.current.getContext('2d');
            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 }
                },
            });
            setVideoStream(stream);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});

                const initDetection = () => {
                    if (!hasNativeDetector && !faceModelRef.current) {
                        setTimeout(() => {
                            if (!faceModelRef.current && !hasNativeDetector) {
                                setIsDetecting(false);
                                setFaceDetected(true);
                                console.warn("Face model taking too long, fail-open applied.");
                            }
                        }, 3000);
                    }

                    const detectFaceLoop = async () => {
                        if (snapshotRef.current) {
                            faceDetectionRef.current = requestAnimationFrame(detectFaceLoop);
                            return;
                        }

                        if (videoRef.current && videoRef.current.readyState === 4) {
                            try {
                                let detectedFaces = [];
                                if (hasNativeDetector && nativeDetectorRef.current) {
                                    detectedFaces = await nativeDetectorRef.current.detect(videoRef.current);
                                } else if (faceModelRef.current) {
                                    detectedFaces = await faceModelRef.current.estimateFaces(videoRef.current, false);
                                }

                                const isDetected = detectedFaces.length > 0;
                                setFaceDetected(isDetected);
                                drawFaceBox(detectedFaces, videoRef.current);
                                setIsDetecting(prev => prev ? false : prev);
                            } catch (e) {
                                // Ignore frame errors
                            }
                        }
                        faceDetectionRef.current = requestAnimationFrame(detectFaceLoop);
                    };

                    detectFaceLoop();
                };

                videoRef.current.onloadedmetadata = () => {
                    setCameraStarting(false);
                    videoRef.current.play().catch(() => {});
                    initDetection();
                };
            }
        } catch (err) {
            setAttendanceError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
            setIsDetecting(false);
            setCameraStarting(false);
        }
    };

    const toggleCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);
        startCamera(newMode);
    };

    const takeSnapshot = () => {
        if (!videoRef.current || !canvasRef.current || (!faceDetected && isDetecting === false)) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext('2d');
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        setSnapshotBase64(dataUrl);

        if (overlayRef.current) {
            const overlayCtx = overlayRef.current.getContext('2d');
            overlayCtx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        }
    };

    const retakeSnapshot = () => {
        setSnapshotBase64(null);
        setFaceDetected(false);
        setIsDetecting(true);

        if (overlayRef.current) {
            const ctx = overlayRef.current.getContext('2d');
            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        }

        const currentStream = streamRef.current || videoStream;
        const isStreamActive = currentStream && currentStream.active && currentStream.getVideoTracks().some(track => track.readyState === 'live');

        if (!isStreamActive) {
            startCamera(facingMode);
        } else if (videoRef.current) {
            if (videoRef.current.srcObject !== currentStream) {
                videoRef.current.srcObject = currentStream;
            }
            videoRef.current.play().catch(() => {});
        }
    };

    const handleAttendanceSubmit = async () => {
        if (!activity || !snapshotBase64 || !currentCoords) {
            alert('Foto snapshot live dan titik lokasi GPS wajib tersedia.');
            return;
        }

        setSubmittingAttendance(true);
        setAttendanceError(null);

        try {
            const res = await api.post('/attendances', {
                activity_id: activity.id,
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
                photo_base64: snapshotBase64,
            });

            if (res.data.success) {
                setAttendanceSuccess(res.data.message);
                if (onSuccess) onSuccess(res.data.message);
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (err) {
            setAttendanceError(err.response?.data?.message || 'Gagal merekam absensi.');
        } finally {
            setSubmittingAttendance(false);
        }
    };

    const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    if (!isOpen || !activity) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-lg max-h-[94vh] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                {/* Header Modal */}
                <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold">Absensi Digital</h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-400">{activity.title}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={toggleCamera}
                            title="Ganti Kamera Depan/Belakang"
                            className="text-slate-400 hover:text-white p-1 rounded-lg"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-1 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Modal */}
                <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                    <div className="relative w-full aspect-[3/4] sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                        {cameraStarting && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-white text-xs font-medium animate-pulse">Menghidupkan Kamera...</span>
                                </div>
                            </div>
                        )}
                        {/* Video Element: Always mounted to keep active stream alive and prevent black screen on retake */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                        />
                        <canvas
                            ref={overlayRef}
                            className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${snapshotBase64 ? 'hidden' : ''}`}
                        />

                        {/* Snapshot Preview: Overlay on top of video when snapshot is taken */}
                        {snapshotBase64 && (
                            <img
                                src={snapshotBase64}
                                alt="Snapshot Presensi"
                                className="absolute inset-0 w-full h-full object-cover z-20"
                            />
                        )}

                        {/* Face detection badge: only show when camera is active and no snapshot */}
                        {!snapshotBase64 && (
                            <div className="absolute inset-0 pointer-events-none z-10">
                                <div className="absolute top-4 left-0 right-0 flex justify-center">
                                    {isDetecting ? (
                                        <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm animate-pulse shadow-sm">
                                            Menyiapkan Pendeteksi Wajah...
                                        </span>
                                    ) : faceDetected ? (
                                        <span className="bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5" />
                                            Wajah Terdeteksi
                                        </span>
                                    ) : (
                                        <span className="bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg shadow-red-500/20 animate-pulse flex items-center gap-1.5">
                                            <X className="w-3.5 h-3.5" />
                                            Wajah Tidak Terdeteksi
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Info Geolocation GPS */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-700">Posisi GPS Anda:</span>
                            {geoLoading ? (
                                <span>Mendeteksi...</span>
                            ) : currentCoords ? (
                                <span className="text-green-700 font-bold">
                                    {currentCoords.latitude.toFixed(5)}, {currentCoords.longitude.toFixed(5)}
                                </span>
                            ) : (
                                <span className="text-red-600">Tidak Terdeteksi</span>
                            )}
                        </div>
                        {currentCoords && activity && (
                            <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                                <span className="text-slate-500">Jarak ke Acara:</span>
                                <span className="font-bold text-slate-800">
                                    ~{calculateDistanceMeters(
                                        currentCoords.latitude,
                                        currentCoords.longitude,
                                        activity.latitude,
                                        activity.longitude
                                    )} meter (Radius max: {activity.radius_meters}m)
                                </span>
                            </div>
                        )}
                    </div>

                    {geoError && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">{geoError}</div>}
                    {attendanceError && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">{attendanceError}</div>}
                    {attendanceSuccess && <div className="p-2.5 bg-green-50 text-green-800 text-xs font-bold rounded-lg">{attendanceSuccess}</div>}

                    {/* Tombol Aksi */}
                    <div className="flex gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                        {!snapshotBase64 ? (
                            <button
                                type="button"
                                onClick={takeSnapshot}
                                disabled={!currentCoords || geoLoading || !faceDetected}
                                className="w-full py-2.5 sm:py-3 bg-[#3B996D] text-white rounded-xl text-xs sm:text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                Ambil Foto
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={retakeSnapshot}
                                    disabled={submittingAttendance}
                                    className="flex-1 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                                >
                                    Ulangi Foto
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAttendanceSubmit}
                                    disabled={submittingAttendance}
                                    className="flex-1 py-2.5 sm:py-3 bg-[#3B996D] hover:bg-[#2e7d58] text-white rounded-xl text-xs sm:text-sm font-bold disabled:opacity-60 transition shadow-xs cursor-pointer"
                                >
                                    {submittingAttendance ? 'Mengirim...' : 'Kirim Absensi'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraCaptureModal;
