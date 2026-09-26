<?php

namespace App\Services;

class AttendanceVerificationService
{
    /**
     * Radius Bumi dalam meter
     */
    const EARTH_RADIUS = 6371000;

    /**
     * Hitung jarak dua titik koordinat (meter) menggunakan rumus Haversine.
     *
     * @param float $lat1 Latitude mahasiswa
     * @param float $lon1 Longitude mahasiswa
     * @param float $lat2 Latitude kegiatan
     * @param float $lon2 Longitude kegiatan
     * @return float Jarak dalam meter (dibulatkan ke 2 desimal)
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distance = self::EARTH_RADIUS * $c;

        return round($distance, 2);
    }

    /**
     * Tentukan status absensi digital berdasarkan jarak dan radius toleransi kegiatan.
     *
     * @param float $distance Jarak terhitung dalam meter
     * @param float $radiusMeters Radius toleransi kegiatan (default 10 meter)
     * @return array ['status' => 'Hadir'|'Hadir-Mencurigakan', 'in_radius' => bool]
     */
    public function verifyGeofence(float $distance, float $radiusMeters = 10.0): array
    {
        $inRadius = $distance <= $radiusMeters;

        return [
            'status' => $inRadius ? 'Hadir' : 'Hadir-Mencurigakan',
            'in_radius' => $inRadius,
            'distance_meters' => $distance,
            'radius_meters' => $radiusMeters,
        ];
    }
}
