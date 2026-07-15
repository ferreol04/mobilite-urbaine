<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('pseudo', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->withCount(['alertes as alertes_count' => fn($q) => $q->withTrashed()])->latest('registration_date')->paginate(20));
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(
            $user->loadCount(['alertes as alertes_count' => fn($q) => $q->withTrashed()])
                 ->load(['alertes' => fn($q) => $q->withTrashed()->latest('reported_at')->limit(10)])
        );
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de modifier le statut d\'un administrateur.'], 403);
        }

        $request->validate([
            'status' => ['required', 'in:active,suspended,banned'],
        ]);

        $user->update(['status' => $request->status]);

        return response()->json($user->fresh());
    }
}
