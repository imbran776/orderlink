<?php

use App\Models\Delivery;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Contracts\Console\Kernel;

/**
 * Script untuk memperbaiki orders yang tidak memiliki order_items
 * Menghapus order orphan karena data tidak valid (order tanpa item tidak masuk akal)
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo "🔍 Mencari orders tanpa order_items...\n\n";

// Query orders yang tidak punya order_items
$orphanedOrders = Order::leftJoin('order_items', 'orders.id', '=', 'order_items.order_id')
    ->select('orders.*')
    ->whereNull('order_items.id')
    ->get();

if ($orphanedOrders->isEmpty()) {
    echo "✅ Tidak ada orphaned orders. Database sudah bersih!\n";
    exit(0);
}

echo "🚨 Ditemukan {$orphanedOrders->count()} orders tanpa order_items:\n\n";

foreach ($orphanedOrders as $order) {
    echo "   - Order #{$order->order_number} (ID: {$order->id})\n";
    echo "     User ID: {$order->user_id}\n";
    echo '     Total: Rp '.number_format($order->total_amount, 0, ',', '.')."\n";
    echo "     Status: {$order->status}\n";
    echo "     Created: {$order->created_at}\n\n";
}

// Konfirmasi
echo '❓ Hapus semua orphaned orders? (y/n): ';
$handle = fopen('php://stdin', 'r');
$confirm = trim(fgets($handle));
fclose($handle);

if (strtolower($confirm) !== 'y') {
    echo "❌ Dibatalkan. Tidak ada perubahan.\n";
    exit(0);
}

echo "\n🗑️  Menghapus orphaned orders...\n";

$deleted = 0;
foreach ($orphanedOrders as $order) {
    try {
        // Hapus data terkait dulu
        Delivery::where('order_id', $order->id)->delete();
        Invoice::where('order_id', $order->id)->delete();

        // Hapus order
        $order->delete();

        echo "   ✓ Dihapus: Order #{$order->order_number}\n";
        $deleted++;
    } catch (Exception $e) {
        echo "   ✗ Gagal hapus Order #{$order->order_number}: {$e->getMessage()}\n";
    }
}

echo "\n✅ Selesai! {$deleted} orders berhasil dihapus.\n";
