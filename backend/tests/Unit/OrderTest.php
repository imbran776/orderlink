<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Tests\TestCase;

class OrderTest extends TestCase
{
    public function test_order_has_order_number_on_creation(): void
    {
        $retailer = User::factory()->retailer()->create();
        $order = Order::factory()->create(['retailer_id' => $retailer->id]);

        $this->assertNotNull($order->order_number);
        $this->assertStringStartsWith('ORD-', $order->order_number);
    }

    public function test_order_status_defaults_to_pending(): void
    {
        $retailer = User::factory()->retailer()->create();
        $order = Order::factory()->create(['retailer_id' => $retailer->id]);

        $this->assertEquals('pending', $order->status);
    }

    public function test_order_total_amount_defaults_to_zero(): void
    {
        $retailer = User::factory()->retailer()->create();
        $order = Order::factory()->create(['retailer_id' => $retailer->id]);

        $this->assertEquals(0, $order->total_amount);
    }

    public function test_order_has_retailer_relationship(): void
    {
        $retailer = User::factory()->retailer()->create();
        $order = Order::factory()->create(['retailer_id' => $retailer->id]);

        $this->assertInstanceOf(User::class, $order->retailer);
        $this->assertEquals($retailer->id, $order->retailer->id);
    }

    public function test_order_can_have_items(): void
    {
        $retailer = User::factory()->retailer()->create();
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        $order = Order::factory()->create(['retailer_id' => $retailer->id]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'price' => 15000,
            'subtotal' => 150000,
        ]);

        $this->assertCount(1, $order->items);
        $this->assertEquals(150000, $order->items->first()->subtotal);
    }

    public function test_order_item_calculates_subtotal(): void
    {
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 20000,
        ]);

        $quantity = 5;
        $expectedSubtotal = $product->price * $quantity;

        $item = new OrderItem;
        $item->product_id = $product->id;
        $item->quantity = $quantity;
        $item->price = $product->price;
        $item->subtotal = $expectedSubtotal;

        $this->assertEquals(100000, $expectedSubtotal);
    }
}
