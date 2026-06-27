<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'total_amount' => (float) $this->total_amount,
            'notes' => $this->notes,
            'delivery_address' => $this->delivery_address,
            'scheduled_delivery' => $this->scheduled_delivery?->format('Y-m-d'),
            'retailer' => $this->whenLoaded('retailer', fn () => [
                'id' => $this->retailer->id,
                'name' => $this->retailer->name,
                'company_name' => $this->retailer->company_name,
                'phone' => $this->retailer->phone,
            ]),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'sku' => $item->product->sku,
                    'unit' => $item->product->unit,
                ] : null,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => (float) $item->subtotal,
            ])
            ),
            'delivery' => $this->whenLoaded('delivery', fn () => $this->delivery ? new DeliveryResource($this->delivery) : null
            ),
            'invoice' => $this->whenLoaded('invoice', fn () => $this->invoice ? [
                'id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'status' => $this->invoice->status,
                'due_date' => $this->invoice->due_date?->format('Y-m-d'),
            ] : null
            ),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
