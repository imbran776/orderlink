<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'estimated_arrival' => $this->estimated_arrival?->format('Y-m-d H:i:s'),
            'delivered_at' => $this->delivered_at?->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'driver' => $this->whenLoaded('driver', fn () => $this->driver ? [
                'id' => $this->driver->id,
                'name' => $this->driver->name,
                'phone' => $this->driver->phone,
            ] : null
            ),
            'proof' => $this->whenLoaded('proof', fn () => $this->proof ? [
                'photo' => $this->proof->photo ? asset('storage/'.$this->proof->photo) : null,
                'recipient_name' => $this->proof->recipient_name,
                'notes' => $this->proof->notes,
            ] : null
            ),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
