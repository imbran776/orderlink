<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductCategoryController extends Controller
{
    public function index()
    {
        return Cache::remember('categories_all', 3600, function () {
            return response()->json(['data' => ProductCategory::withCount('products')->get()]);
        });
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string']);
        $cat = ProductCategory::create($data);
        Cache::forget('categories_all');

        return response()->json(['message' => 'Kategori ditambahkan', 'data' => $cat], 201);
    }

    public function update(Request $request, ProductCategory $category)
    {
        $data = $request->validate(['name' => 'sometimes|string|max:255', 'description' => 'nullable|string']);
        $category->update($data);
        Cache::forget('categories_all');

        return response()->json(['message' => 'Kategori diperbarui', 'data' => $category]);
    }

    public function destroy(ProductCategory $category)
    {
        $category->delete();
        Cache::forget('categories_all');

        return response()->json(['message' => 'Kategori dihapus']);
    }
}
