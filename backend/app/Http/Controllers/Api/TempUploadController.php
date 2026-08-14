<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TempUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TempUploadController extends Controller
{
    // Upload temporaire de photos (avant authentification)
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'photos'   => ['required', 'array', 'max:5'],
            'photos.*' => ['image', 'max:2048'],
        ]);

        // Jeton propre à ce lot d'upload : il faudra le renvoyer tel quel
        // pour pouvoir rattacher ces photos à une alerte (voir AlerteController).
        // Ça empêche un utilisateur de rattacher à sa propre alerte une photo
        // uploadée par quelqu'un d'autre en devinant/récupérant son chemin.
        $token = Str::random(40);

        $paths = [];
        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('temp_alertes', 'public');
            TempUpload::create(['path' => $path, 'token' => $token, 'created_at' => now()]);
            $paths[] = $path;
        }

        return response()->json(['paths' => $paths, 'upload_token' => $token]);
    }
}
