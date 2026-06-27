<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $fillable = [
        'order_id', 'driver_id', 'status',
        'lat', 'lng', 'estimated_arrival', 'delivered_at', 'notes',
    ];

    // Tambahkan accessor ke output JSON otomatis
    protected $appends = ['status_label'];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'estimated_arrival' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function proof()
    {
        return $this->hasOne(DeliveryProof::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'assigned' => 'Ditugaskan',
            'picked_up' => 'Diambil',
            'on_the_way' => 'Dalam Perjalanan',
            'delivered' => 'Terkirim',
            'failed' => 'Gagal',
            default => $this->status,
        };
    }
}
