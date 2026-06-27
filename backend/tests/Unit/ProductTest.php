<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\ProductCategory;
use Tests\TestCase;

class ProductTest extends TestCase
{
    public function test_product_has_fillable_fields(): void
    {
        $product = new Product;
        $fillable = $product->getFillable();

        $this->assertContains('name', $fillable);
        $this->assertContains('price', $fillable);
        $this->assertContains('stock', $fillable);
        $this->assertContains('sku', $fillable);
    }

    public function test_product_price_casts_to_decimal(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 15000.50,
        ]);

        $this->assertEquals(15000.50, (float) $product->price);
    }

    public function test_product_is_low_stock(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock' => 5,
            'min_stock' => 10,
        ]);

        $this->assertTrue($product->isLowStock());
    }

    public function test_product_is_not_low_stock(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock' => 50,
            'min_stock' => 10,
        ]);

        $this->assertFalse($product->isLowStock());
    }

    public function test_product_has_category(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $this->assertInstanceOf(ProductCategory::class, $product->category);
    }

    public function test_product_is_active_default(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $this->assertTrue($product->is_active);
    }
}
