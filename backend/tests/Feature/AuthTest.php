<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Retailer',
            'email' => 'budi@test.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'retailer',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_user_cannot_register_with_weak_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test',
            'email' => 'weak@test.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
            'role' => 'retailer',
        ]);

        $this->assertNotEquals(201, $response->getStatusCode());
    }

    public function test_user_can_login(): void
    {
        User::factory()->retailer()->create([
            'email' => 'login@test.com',
            'password' => bcrypt('Password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@test.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->retailer()->create([
            'email' => 'wrong@test.com',
            'password' => bcrypt('Password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'wrong@test.com',
            'password' => 'wrongpassword',
        ]);

        $this->assertNotEquals(200, $response->getStatusCode());
    }

    public function test_unauthenticated_user_gets_401(): void
    {
        $response = $this->getJson('/api/profile');
        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_authenticated_user_can_access_profile(): void
    {
        $user = User::factory()->retailer()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/profile');
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_authorization_retailer_cannot_access_distributor_routes(): void
    {
        $retailer = User::factory()->retailer()->create();
        $token = $retailer->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/orders');
        // 401 (unauthenticated) or 403 (forbidden) are both acceptable
        $this->assertContains($response->getStatusCode(), [401, 403]);
    }

    public function test_distributor_can_access_all_orders(): void
    {
        $distributor = User::factory()->distributor()->create();
        $token = $distributor->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/orders');
        $this->assertEquals(200, $response->getStatusCode());
    }
}
