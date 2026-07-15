<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Category::withCount('typeIncidents')
                ->with('typeIncidents:id,category_id,name,icon,disappearance_mode,validity_duration,is_active')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:150', 'unique:categories,name'],
        ]);

        $category = Category::create(['name' => $request->name, 'is_active' => true]);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:150', 'unique:categories,name,' . $category->id],
        ]);

        $category->update($request->only('name'));

        return response()->json($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        // Désactivation en cascade (catégorie + tous ses types)
        $category->update(['is_active' => false]);
        $category->typeIncidents()->update(['is_active' => false]);

        return response()->json(['message' => 'Catégorie désactivée.']);
    }

    public function restore(Category $category): JsonResponse
    {
        $category->update(['is_active' => true]);

        return response()->json(['message' => 'Catégorie réactivée.']);
    }
}
