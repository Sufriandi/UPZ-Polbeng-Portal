<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageCompressionService
{
    /**
     * Simpan dan kompres berkas unggahan (gambar dikompres, non-gambar disimpan apa adanya).
     *
     * @param UploadedFile $file Berkas unggahan dari request
     * @param string $directory Direktori tujuan di storage disk public (misal: 'leave_proofs')
     * @param int $maxDimension Batas maksimal lebar atau tinggi gambar dalam pixel (default: 1600)
     * @param int $quality Kualitas kompresi JPEG 1-100 (default: 75)
     * @return string Path relatif berkas yang tersimpan di disk public
     */
    public static function storeAndCompress(
        UploadedFile $file,
        string $directory,
        int $maxDimension = 1600,
        int $quality = 75
    ): string {
        $mime = $file->getMimeType();
        $isImage = str_starts_with($mime, 'image/') && !str_contains($mime, 'svg');

        // Jika bukan gambar (misal PDF), simpan langsung tanpa kompresi
        if (!$isImage) {
            $fileName = time() . '_' . Str::random(6) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            return $file->storeAs($directory, $fileName, 'public');
        }

        try {
            $rawContent = file_get_contents($file->getRealPath());
            $srcImage = @imagecreatefromstring($rawContent);

            if (!$srcImage) {
                // Fallback jika GD gagal membuat gambar dari string
                $fileName = time() . '_' . Str::random(6) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
                return $file->storeAs($directory, $fileName, 'public');
            }

            // Tangani orientasi EXIF (khusus kamera smartphone)
            if (function_exists('exif_read_data')) {
                $exif = @exif_read_data($file->getRealPath());
                if (!empty($exif['Orientation'])) {
                    switch ($exif['Orientation']) {
                        case 3:
                            $srcImage = imagerotate($srcImage, 180, 0);
                            break;
                        case 6:
                            $srcImage = imagerotate($srcImage, -90, 0);
                            break;
                        case 8:
                            $srcImage = imagerotate($srcImage, 90, 0);
                            break;
                    }
                }
            }

            $origWidth = imagesx($srcImage);
            $origHeight = imagesy($srcImage);

            // Hitung skala baru jika dimensi melebihi batas maksimal
            if ($origWidth > $maxDimension || $origHeight > $maxDimension) {
                if ($origWidth >= $origHeight) {
                    $newWidth = $maxDimension;
                    $newHeight = (int) round(($origHeight / $origWidth) * $maxDimension);
                } else {
                    $newHeight = $maxDimension;
                    $newWidth = (int) round(($origWidth / $origHeight) * $maxDimension);
                }

                $targetImage = imagecreatetruecolor($newWidth, $newHeight);

                // Pertahankan transparansi bila ada (PNG/GIF)
                imagealphablending($targetImage, false);
                imagesavealpha($targetImage, true);

                imagecopyresampled(
                    $targetImage,
                    $srcImage,
                    0, 0, 0, 0,
                    $newWidth,
                    $newHeight,
                    $origWidth,
                    $origHeight
                );

                imagedestroy($srcImage);
                $finalImage = $targetImage;
            } else {
                $finalImage = $srcImage;
            }

            // Pastikan direktori tujuan tersedia di storage/app/public
            $storageDir = storage_path('app/public/' . $directory);
            if (!file_exists($storageDir)) {
                mkdir($storageDir, 0755, true);
            }

            $cleanOriginalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $cleanOriginalName = preg_replace('/[^a-zA-Z0-9_-]/', '', $cleanOriginalName);
            $cleanOriginalName = substr($cleanOriginalName, 0, 40);

            $newFileName = time() . '_' . Str::random(6) . ($cleanOriginalName ? '_' . $cleanOriginalName : '') . '.jpg';
            $targetFilePath = $storageDir . DIRECTORY_SEPARATOR . $newFileName;

            // Simpan gambar dengan kompresi JPEG 75%
            imagejpeg($finalImage, $targetFilePath, $quality);
            imagedestroy($finalImage);

            return $directory . '/' . $newFileName;
        } catch (\Throwable $e) {
            // Fallback aman jika terjadi error kompresi
            report($e);
            $fileName = time() . '_' . Str::random(6) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            return $file->storeAs($directory, $fileName, 'public');
        }
    }
}
