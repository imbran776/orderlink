<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'description' => $this->description,
            'price' => (float) $this->price,
            'wholesale_price' => $this->wholesale_price !== null ? (float) $this->wholesale_price : null,
            'unit' => $this->unit,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'is_low_stock' => $this->isLowStock(),
            'image' => $this->image ? asset('storage/'.$this->image) : null,
            'is_active' => $this->is_active,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
