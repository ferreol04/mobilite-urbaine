<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parametre;
use Illuminate\Http\JsonResponse;

class ConfigPubliqueController extends Controller
{
    /**
     * Expose uniquement les paramètres nécessaires au frontend utilisateur.
     * Accessible sans authentification.
     */
    public function index(): JsonResponse
    {
        $cles = [
            'seuil_confirmation_modification',
            'delai_modification',
            'delai_interaction',
        ];

        $parametres = Parametre::whereIn('key', $cles)
            ->pluck('value', 'key')
            ->map(fn ($v) => (int) $v);

        return response()->json($parametres);
    }
}
