<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $products = $query->latest()->paginate(15);

        return ProductResource::collection($products);
    }

    public function lowStock()
    {
        $products = Product::with('category')->lowStock()->get();

        return ProductResource::collection($products);
    }

    public function adjustment(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
            'reference' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

            if ($validated['type'] === 'out' && $product->stock < $validated['quantity']) {
                return response()->json(['message' => 'Stok tidak mencukupi'], 422);
            }

            if ($validated['type'] === 'in') {
                $product->increment('stock', $validated['quantity']);
            } else {
                $product->decrement('stock', $validated['quantity']);
            }

            StockMovement::create([
                'product_id' => $product->id,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'reference' => $validated['reference'] ?? 'Manual Adjustment',
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Penyesuaian stok berhasil',
                'current_stock' => $product->fresh()->stock,
            ]);
        });
    }

    public function movements(Request $request, Product $product)
    {
        $movements = StockMovement::with('createdBy')
            ->where('product_id', $product->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'product' => ['id' => $product->id, 'name' => $product->name, 'stock' => $product->stock],
            'movements' => $movements,
        ]);
    }
}
