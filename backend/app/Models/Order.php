<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'retailer_id', 'status',
        'total_amount', 'notes', 'delivery_address', 'scheduled_delivery',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'scheduled_delivery' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            $order->order_number = 'ORD-'.strtoupper(Str::random(8));
        });
    }

    public function retailer()
    {
        return $this->belongsTo(User::class, 'retailer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }
}
