<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryProof extends Model
{
    protected $fillable = ['delivery_id', 'photo', 'recipient_name', 'notes'];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }
}
