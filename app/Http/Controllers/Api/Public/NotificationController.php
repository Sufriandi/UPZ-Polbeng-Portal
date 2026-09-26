<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Ambil daftar notifikasi pendaftar yang sedang login.
     */
    public function index(Request $request)
    {
        $pendaftarId = $request->user()->id;

        $notifications = Notification::where('pendaftar_id', $pendaftarId)
            ->orderBy('created_at', 'desc')
            ->take(30)
            ->get();

        $unreadCount = Notification::where('pendaftar_id', $pendaftarId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    /**
     * Tandai satu notifikasi telah dibaca.
     */
    public function markAsRead(Request $request, $id)
    {
        $pendaftarId = $request->user()->id;

        $notification = Notification::where('pendaftar_id', $pendaftarId)
            ->where('id', $id)
            ->firstOrFail();

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai telah dibaca.',
        ]);
    }

    /**
     * Tandai seluruh notifikasi telah dibaca.
     */
    public function markAllAsRead(Request $request)
    {
        $pendaftarId = $request->user()->id;

        Notification::where('pendaftar_id', $pendaftarId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai telah dibaca.',
        ]);
    }
}
