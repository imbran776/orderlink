<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'phone', 'address', 'company_name', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    // ── Helpers ───────────────────────────────────────────────────────────────
    public function isDistributor(): bool
    {
        return $this->role === 'distributor';
    }

    public function isRetailer(): bool
    {
        return $this->role === 'retailer';
    }

    public function isDriver(): bool
    {
        return $this->role === 'driver';
    }

    // ── Relationships ─────────────────────────────────────────────────────────
    public function orders()
    {
        return $this->hasMany(Order::class, 'retailer_id');
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'driver_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'created_by');
    }
}
