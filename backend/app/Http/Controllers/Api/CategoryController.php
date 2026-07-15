<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->get(['id', 'name']);

        return response()->json($categories);
    }

    public function typeIncidents(Category $category): JsonResponse
    {
        if (!$category->is_active) {
            return response()->json(['message' => 'Catégorie introuvable.'], 404);
        }

        $types = $category->typeIncidents()
            ->where('is_active', true)
            ->get(['id', 'category_id', 'name', 'icon', 'disappearance_mode', 'validity_duration']);

        return response()->json($types);
    }
}
