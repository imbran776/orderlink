<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number', 'order_id', 'total_amount',
        'status', 'due_date', 'paid_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($invoice) {
            $invoice->invoice_number = 'INV-'.date('Ymd').'-'.strtoupper(Str::random(6));
        });
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
