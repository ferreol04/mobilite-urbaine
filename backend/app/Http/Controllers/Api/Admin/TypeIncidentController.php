<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TypeIncident;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TypeIncidentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TypeIncident::with('category:id,name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id'        => ['required', 'exists:categories,id'],
            'name'               => ['required', 'string', 'max:150', 'unique:type_incidents,name'],
            'icon'               => ['nullable', 'string', 'max:100'],
            'disappearance_mode' => ['required', 'in:automatic,report'],
            'validity_duration'  => ['required_if:disappearance_mode,automatic', 'nullable', 'integer', 'min:1'],
        ]);

        $type = TypeIncident::create([
            'category_id'        => $request->category_id,
            'name'               => $request->name,
            'icon'               => $request->icon,
            'disappearance_mode' => $request->disappearance_mode,
            'validity_duration'  => $request->disappearance_mode === 'automatic' ? $request->validity_duration : null,
            'is_active'          => true,
        ]);

        return response()->json($type->load('category:id,name'), 201);
    }

    public function update(Request $request, TypeIncident $typeIncident): JsonResponse
    {
        $request->validate([
            'category_id'        => ['sometimes', 'exists:categories,id'],
            'name'               => ['sometimes', 'string', 'max:150', 'unique:type_incidents,name,' . $typeIncident->id],
            'icon'               => ['sometimes', 'string', 'max:100'],
            'disappearance_mode' => ['sometimes', 'in:automatic,report'],
            'validity_duration'  => ['nullable', 'integer', 'min:1'],
        ]);

        $typeIncident->update($request->only(['category_id', 'name', 'icon', 'disappearance_mode', 'validity_duration']));

        return response()->json($typeIncident->fresh()->load('category:id,name'));
    }

    public function destroy(TypeIncident $typeIncident): JsonResponse
    {
        $typeIncident->update(['is_active' => false]);

        return response()->json(['message' => 'Type d\'incident désactivé.']);
    }

    public function restore(TypeIncident $typeIncident): JsonResponse
    {
        $typeIncident->update(['is_active' => true]);

        return response()->json(['message' => 'Type d\'incident réactivé.']);
    }
}
