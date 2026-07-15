<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TempUploadController extends Controller
{
    // Upload temporaire de photos (avant authentification)
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'photos'   => ['required', 'array', 'max:5'],
            'photos.*' => ['image', 'max:2048'],
        ]);

        $paths = [];
        foreach ($request->file('photos') as $photo) {
            $paths[] = $photo->store('temp_alertes', 'public');
        }

        return response()->json(['paths' => $paths]);
    }
}
