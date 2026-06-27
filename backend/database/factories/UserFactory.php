<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => bcrypt('password'),
            'role' => 'retailer',
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'is_active' => true,
        ];
    }

    public function distributor(): static
    {
        return $this->state(['role' => 'distributor']);
    }

    public function retailer(): static
    {
        return $this->state(['role' => 'retailer']);
    }

    public function driver(): static
    {
        return $this->state(['role' => 'driver']);
    }
}
