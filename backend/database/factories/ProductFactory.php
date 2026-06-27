<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'category_id' => ProductCategory::factory(),
            'name' => fake()->unique()->words(3, true),
            'sku' => fake()->unique()->ean13(),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 10000, 500000),
            'wholesale_price' => 0,
            'unit' => 'pcs',
            'stock' => fake()->numberBetween(0, 1000),
            'min_stock' => 10,
            'is_active' => true,
            'image' => null,
        ];
    }
}
