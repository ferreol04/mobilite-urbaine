<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\AlerteMiseAJour;
use App\Events\AlerteSupprimee;
use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alerte::with(['user:id,last_name,first_name,pseudo', 'category:id,name', 'typeIncident:id,name,icon']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('type_incident_id')) {
            $query->where('type_incident_id', $request->type_incident_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('pseudo', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest('reported_at')->paginate(20));
    }

    public function show(Alerte $alerte): JsonResponse
    {
        return response()->json(
            $alerte->load(['user:id,last_name,first_name,pseudo', 'category:id,name', 'typeIncident:id,name,icon', 'medias', 'interactions.user:id,last_name,first_name,pseudo'])
        );
    }

    public function updateStatus(Request $request, Alerte $alerte): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,expired,resolved,false'],
        ]);

        $alerte->update(['status' => $request->status]);

        // Diffuser l'événement en temps réel
        if ($request->status !== 'active') {
            broadcast(new AlerteSupprimee($alerte->id))->toOthers();
        } else {
            broadcast(new AlerteMiseAJour($alerte->fresh()))->toOthers();
        }

        return response()->json($alerte->fresh());
    }
}
