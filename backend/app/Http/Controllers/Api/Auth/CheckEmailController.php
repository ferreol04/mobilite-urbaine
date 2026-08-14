<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CheckEmailController extends Controller
{
    /**
     * Vérification légère de disponibilité d'un email pendant l'inscription,
     * sans effet de bord (contrairement à ContributeAuthController::identify
     * qui envoie un email). Utilisée pour donner un retour rapide dès
     * l'étape "Contact" du formulaire, avant la soumission finale.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $available = !User::where('email', $request->email)->exists();

        return response()->json(['available' => $available]);
    }
}
