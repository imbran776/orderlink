<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\DeliveryProof;
use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    // Distributor: semua delivery
    public function index(Request $request)
    {
        $query = Delivery::with(['order.retailer', 'driver', 'proof']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return DeliveryResource::collection($query->latest()->paginate(15));
    }

    // Distributor: detail delivery
    public function show(Delivery $delivery)
    {
        return new DeliveryResource($delivery->load(['order.retailer', 'driver', 'proof']));
    }

    // Driver: daftar delivery yang ditugaskan
    public function myDeliveries(Request $request)
    {
        $deliveries = Delivery::with(['order.retailer', 'order.items.product', 'proof'])
            ->where('driver_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return DeliveryResource::collection($deliveries);
    }

    // Driver: detail delivery milik sendiri
    public function showMyDelivery(Request $request, Delivery $delivery)
    {
        if ($delivery->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        return new DeliveryResource($delivery->load(['order.retailer', 'order.items.product', 'proof']));
    }

    // Driver: update status pengiriman
    public function updateStatus(Request $request, Delivery $delivery)
    {
        if ($delivery->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:picked_up,on_the_way,delivered,failed',
            'notes' => 'nullable|string',
        ]);

        $delivery->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $delivery->notes,
            'delivered_at' => $validated['status'] === 'delivered' ? now() : $delivery->delivered_at,
        ]);

        // Refresh agar status_label accessor baca status BARU, bukan yang lama di memory
        $delivery->refresh();

        if ($validated['status'] === 'delivered') {
            $delivery->order->update(['status' => 'delivered']);
            if ($delivery->order->invoice) {
                $delivery->order->invoice->update(['status' => 'unpaid']);
            }
        }

        // Notifikasi ke retailer
        Notification::create([
            'user_id' => $delivery->order->retailer_id,
            'title' => 'Update Pengiriman',
            'message' => "Pengiriman order {$delivery->order->order_number}: {$delivery->status_label}",
            'type' => 'delivery_status',
            'reference_id' => $delivery->order_id,
        ]);

        return response()->json([
            'message' => 'Status pengiriman diperbarui',
            'data' => new DeliveryResource($delivery->fresh()),
        ]);
    }

    // Driver: upload bukti pengiriman (POD)
    public function uploadProof(Request $request, Delivery $delivery)
    {
        if ($delivery->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $validated = $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'recipient_name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $photoPath = $request->file('photo')->store('delivery-proofs', 'public');

        $proof = DeliveryProof::updateOrCreate(
            ['delivery_id' => $delivery->id],
            [
                'photo' => $photoPath,
                'recipient_name' => $validated['recipient_name'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        $delivery->update(['status' => 'delivered', 'delivered_at' => now()]);
        $delivery->order->update(['status' => 'delivered']);

        // Update invoice — sama seperti updateStatus() saat status = delivered
        $delivery->order->load('invoice');
        if ($delivery->order->invoice) {
            $delivery->order->invoice->update(['status' => 'unpaid']);
        }

        // Notifikasi ke retailer
        Notification::create([
            'user_id' => $delivery->order->retailer_id,
            'title' => 'Pesanan Terkirim',
            'message' => "Order {$delivery->order->order_number} telah berhasil diterima oleh {$validated['recipient_name']}",
            'type' => 'delivery_status',
            'reference_id' => $delivery->order_id,
        ]);

        return response()->json(['message' => 'Bukti pengiriman berhasil diunggah', 'data' => $proof]);
    }

    // Driver: update lokasi GPS real-time
    public function updateLocation(Request $request, Delivery $delivery)
    {
        if ($delivery->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $delivery->update(['lat' => $validated['lat'], 'lng' => $validated['lng']]);

        return response()->json([
            'message' => 'Lokasi diperbarui',
            'lat' => $delivery->lat,
            'lng' => $delivery->lng,
        ]);
    }

    // Retailer: tracking order
    public function tracking(Request $request, Order $order)
    {
        if ($order->retailer_id !== $request->user()->id) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        $delivery = $order->delivery()->with(['driver', 'proof'])->first();

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
            ],
            'delivery' => $delivery ? new DeliveryResource($delivery) : null,
        ]);
    }
}
