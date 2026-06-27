<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Delivery;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Distributor: semua order
    public function index(Request $request)
    {
        $cacheKey = 'orders_'.md5(json_encode([
            'status' => $request->status,
            'search' => $request->search,
            'page' => $request->page ?? 1,
        ]));

        return \Cache::remember($cacheKey, 60, function () use ($request) {
            $query = Order::with([
                'retailer:id,name,company_name,phone',
                'items' => fn ($q) => $q->select('id', 'order_id', 'product_id', 'quantity', 'price', 'subtotal')
                    ->with('product:id,name,sku,unit'),
            ])->select('id', 'order_number', 'retailer_id', 'status', 'total_amount', 'created_at');

            if ($request->status) {
                $query->where('status', $request->status);
            }
            if ($request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('order_number', 'like', "%{$request->search}%")
                        ->orWhereHas('retailer', fn ($r) => $r->where('name', 'like', "%{$request->search}%"));
                });
            }

            return OrderResource::collection($query->latest()->paginate(15));
        });
    }

    // Retailer: order milik sendiri
    public function myOrders(Request $request)
    {
        $query = Order::with('items.product')->where('retailer_id', $request->user()->id);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return OrderResource::collection($query->latest()->paginate(15));
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load(['retailer', 'items.product', 'delivery.driver', 'delivery.proof', 'invoice']));
    }

    public function showMyOrder(Request $request, Order $order)
    {
        if ($order->retailer_id !== $request->user()->id) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        return new OrderResource($order->load(['items.product', 'delivery.driver', 'delivery.proof', 'invoice']));
    }

    // Retailer: buat order baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string|max:500',
            'scheduled_delivery' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $totalAmount = 0;
                $orderItems = [];

                foreach ($validated['items'] as $item) {
                    // lockForUpdate() mencegah race condition — 2 order bersamaan tidak bisa baca stok yang sama
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if (! $product->is_active) {
                        throw new \Exception("Produk {$product->name} tidak tersedia.");
                    }
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi. Tersedia: {$product->stock}");
                    }

                    $price = $product->wholesale_price ?? $product->price;
                    $subtotal = $price * $item['quantity'];
                    $totalAmount += $subtotal;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $price,
                        'subtotal' => $subtotal,
                    ];
                }

                // Create order
                $order = Order::create([
                    'retailer_id' => $request->user()->id,
                    'total_amount' => $totalAmount,
                    'delivery_address' => $validated['delivery_address'],
                    'scheduled_delivery' => $validated['scheduled_delivery'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]);

                $order->items()->createMany($orderItems);

                // Kurangi stok dan catat movement
                foreach ($validated['items'] as $item) {
                    $product = Product::find($item['product_id']);
                    $product->decrement('stock', $item['quantity']);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'type' => 'out',
                        'quantity' => $item['quantity'],
                        'reference' => $order->order_number,
                        'notes' => 'Order oleh '.$request->user()->name,
                        'created_by' => $request->user()->id,
                    ]);
                }

                // Buat invoice otomatis
                Invoice::create([
                    'order_id' => $order->id,
                    'total_amount' => $totalAmount,
                    'due_date' => now()->addDays(7),
                ]);

                // Notifikasi ke distributor
                $distributor = User::where('role', 'distributor')->first();
                if ($distributor) {
                    Notification::create([
                        'user_id' => $distributor->id,
                        'title' => 'Order Baru Masuk',
                        'message' => "Order {$order->order_number} dari {$request->user()->name} sebesar Rp ".number_format($totalAmount),
                        'type' => 'order',
                        'reference_id' => $order->id,
                    ]);
                }

                return response()->json([
                    'message' => 'Order berhasil dibuat',
                    'data' => new OrderResource($order->load(['items.product', 'invoice'])),
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    // Distributor: update status order
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        // Notifikasi ke retailer
        Notification::create([
            'user_id' => $order->retailer_id,
            'title' => 'Status Order Diperbarui',
            'message' => "Order {$order->order_number} status berubah menjadi {$validated['status']}",
            'type' => 'order_status',
            'reference_id' => $order->id,
        ]);

        return response()->json(['message' => 'Status order diperbarui', 'data' => new OrderResource($order)]);
    }

    // Distributor: assign driver ke order
    public function assignDriver(Request $request, Order $order)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:users,id',
            'estimated_arrival' => 'nullable|date',
        ]);

        $driver = User::where('id', $validated['driver_id'])->where('role', 'driver')->firstOrFail();

        $delivery = Delivery::updateOrCreate(
            ['order_id' => $order->id],
            [
                'driver_id' => $driver->id,
                'status' => 'assigned',
                'estimated_arrival' => $validated['estimated_arrival'] ?? null,
            ]
        );

        $order->update(['status' => 'shipped']);

        // Notifikasi ke driver
        Notification::create([
            'user_id' => $driver->id,
            'title' => 'Pengiriman Baru Ditugaskan',
            'message' => "Anda ditugaskan mengantarkan order {$order->order_number}",
            'type' => 'delivery',
            'reference_id' => $delivery->id,
        ]);

        // Notifikasi ke retailer
        Notification::create([
            'user_id' => $order->retailer_id,
            'title' => 'Pesanan Sedang Dikirim',
            'message' => "Order {$order->order_number} sedang dikirim oleh {$driver->name}",
            'type' => 'delivery',
            'reference_id' => $order->id,
        ]);

        return response()->json(['message' => 'Driver berhasil di-assign', 'data' => $delivery->load('driver')]);
    }

    // Retailer: batalkan order
    public function cancel(Request $request, Order $order)
    {
        if ($order->retailer_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        if (! $order->canBeCancelled()) {
            return response()->json(['message' => 'Order tidak dapat dibatalkan pada status ini'], 422);
        }

        // Kembalikan stok — load items + product dulu agar tidak N+1 dan tidak null
        $order->load('items.product');

        foreach ($order->items as $item) {
            if (! $item->product) {
                continue;
            } // produk sudah dihapus, skip

            $item->product->increment('stock', $item->quantity);
            StockMovement::create([
                'product_id' => $item->product_id,
                'type' => 'in',
                'quantity' => $item->quantity,
                'reference' => $order->order_number,
                'notes' => 'Pembatalan order',
                'created_by' => $request->user()->id,
            ]);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Order berhasil dibatalkan']);
    }
}
