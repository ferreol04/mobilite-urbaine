<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function destroy(Request $request, Media $media): JsonResponse
    {
        $alerte = $media->alerte;

        if ($alerte->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($alerte->status !== 'active') {
            return response()->json(['message' => 'Cette alerte ne peut plus être modifiée.'], 422);
        }

        Storage::disk('public')->delete($media->url);
        $media->delete();

        return response()->json(['message' => 'Photo supprimée.']);
    }
}
