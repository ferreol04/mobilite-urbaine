<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Parametre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Parametre::all());
    }

    public function update(Request $request, Parametre $parametre): JsonResponse
    {
        $request->validate([
            'value' => ['required', 'numeric', 'min:1'],
        ]);

        $parametre->update(['value' => $request->value]);

        return response()->json($parametre->fresh());
    }
}
