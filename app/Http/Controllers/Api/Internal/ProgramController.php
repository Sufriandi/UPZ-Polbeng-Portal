<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\AssistanceProgram;
use App\Models\AssistanceProgramRequirement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = AssistanceProgram::with('requirements')
            ->withCount(['applications', 'activities']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('program_type')) {
            $query->where('program_type', $request->program_type);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $programs = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:beasiswa,bantuan_sosial,lainnya',
            'program_type' => 'required|in:mandiri,kerjasama',
            'partner_name' => 'nullable|string|max:255',
            'quota' => 'required|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:draft,opened,closed,completed',
            'terms' => 'nullable|string',
            'requirements' => 'nullable|array',
            'requirements.*.document_name' => 'required|string|max:255',
            'requirements.*.description' => 'nullable|string',
            'requirements.*.is_required' => 'boolean',
            'requirements.*.allowed_mimes' => 'nullable|string',
            'requirements.*.max_size_kb' => 'nullable|integer',
        ]);

        $slug = Str::slug($validated['name']) . '-' . Str::random(4);

        $program = AssistanceProgram::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'program_type' => $validated['program_type'],
            'partner_name' => $validated['partner_name'] ?? null,
            'quota' => $validated['quota'],
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'status' => $validated['status'],
            'terms' => $validated['terms'] ?? null,
        ]);

        if (!empty($validated['requirements'])) {
            foreach ($validated['requirements'] as $req) {
                AssistanceProgramRequirement::create([
                    'assistance_program_id' => $program->id,
                    'document_name' => $req['document_name'],
                    'description' => $req['description'] ?? null,
                    'is_required' => $req['is_required'] ?? true,
                    'allowed_mimes' => $req['allowed_mimes'] ?? 'pdf,jpg,jpeg,png',
                    'max_size_kb' => $req['max_size_kb'] ?? 5120,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Program bantuan berhasil dibuat.',
            'data' => $program->load('requirements'),
        ], 201);
    }

    public function show($id)
    {
        $program = AssistanceProgram::with(['requirements', 'activities'])
            ->withCount('applications')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $program,
        ]);
    }

    public function update(Request $request, $id)
    {
        $program = AssistanceProgram::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:beasiswa,bantuan_sosial,lainnya',
            'program_type' => 'sometimes|required|in:mandiri,kerjasama',
            'partner_name' => 'nullable|string|max:255',
            'quota' => 'sometimes|required|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|required|in:draft,opened,closed,completed',
            'terms' => 'nullable|string',
        ]);

        $program->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Program bantuan berhasil diperbarui.',
            'data' => $program->fresh('requirements'),
        ]);
    }

    public function destroy($id)
    {
        $program = AssistanceProgram::findOrFail($id);
        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program berhasil dihapus.',
        ]);
    }
}
