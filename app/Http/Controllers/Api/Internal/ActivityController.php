<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityParticipant;
use App\Models\ScholarshipRecipient;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with(['program'])
            ->withCount(['participants', 'attendances']);

        if ($request->filled('assistance_program_id')) {
            $query->where('assistance_program_id', $request->assistance_program_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('location_name', 'like', '%' . $request->search . '%');
        }

        $activities = $query->orderBy('start_time', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'assistance_program_id' => 'nullable|exists:assistance_programs,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location_name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'nullable|numeric|min:1', // default 10.0 jika tidak diisi
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_mandatory' => 'boolean',
            'auto_assign_recipients' => 'boolean', // otomatis daftarkan semua penerima beasiswa aktif
            'participant_user_ids' => 'nullable|array',
        ]);

        $activity = Activity::create([
            'assistance_program_id' => $validated['assistance_program_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'location_name' => $validated['location_name'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'radius_meters' => $validated['radius_meters'] ?? 10.00,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_mandatory' => $validated['is_mandatory'] ?? true,
            'is_active' => true,
        ]);

        // Auto assign penerima beasiswa
        if (!empty($validated['auto_assign_recipients'])) {
            $recipientsQuery = ScholarshipRecipient::where('status', 'active');
            if (!empty($validated['assistance_program_id'])) {
                $recipientsQuery->where('assistance_program_id', $validated['assistance_program_id']);
            }
            $recipientUserIds = $recipientsQuery->pluck('user_id');

            foreach ($recipientUserIds as $uId) {
                ActivityParticipant::firstOrCreate([
                    'activity_id' => $activity->id,
                    'user_id' => $uId,
                ], [
                    'is_mandatory' => $activity->is_mandatory,
                ]);
            }
        } elseif (!empty($validated['participant_user_ids'])) {
            foreach ($validated['participant_user_ids'] as $uId) {
                ActivityParticipant::firstOrCreate([
                    'activity_id' => $activity->id,
                    'user_id' => $uId,
                ], [
                    'is_mandatory' => $activity->is_mandatory,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal kegiatan monitoring berhasil dibuat.',
            'data' => $activity->loadCount('participants'),
        ], 201);
    }

    public function show($id)
    {
        $activity = Activity::with(['program', 'participants.user.studentProfile'])
            ->withCount(['participants', 'attendances'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ]);
    }

    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'assistance_program_id' => 'nullable|exists:assistance_programs,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location_name' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'radius_meters' => 'nullable|numeric|min:1',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $activity->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan monitoring berhasil diperbarui.',
            'data' => $activity,
        ]);
    }

    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan monitoring berhasil dihapus.',
        ]);
    }
}
