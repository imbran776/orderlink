<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\TestCase;

class UserTest extends TestCase
{
    public function test_user_has_role_helpers(): void
    {
        $distributor = User::factory()->distributor()->create();
        $retailer = User::factory()->retailer()->create();
        $driver = User::factory()->driver()->create();

        $this->assertTrue($distributor->isDistributor());
        $this->assertFalse($distributor->isRetailer());
        $this->assertFalse($distributor->isDriver());

        $this->assertTrue($retailer->isRetailer());
        $this->assertFalse($retailer->isDistributor());

        $this->assertTrue($driver->isDriver());
        $this->assertFalse($driver->isDistributor());
    }

    public function test_user_is_active_default(): void
    {
        $user = User::factory()->create();
        $this->assertTrue($user->is_active);
    }
}
