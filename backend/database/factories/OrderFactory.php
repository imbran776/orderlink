<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'retailer_id' => User::factory()->retailer(),
            'status' => 'pending',
            'total_amount' => 0,
            'notes' => fake()->optional()->sentence(),
            'delivery_address' => fake()->address(),
        ];
    }
}
