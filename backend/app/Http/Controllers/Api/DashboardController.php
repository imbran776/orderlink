<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return match ($user->role) {
            'distributor' => $this->distributorDashboard(),
            'retailer' => $this->retailerDashboard($user),
            'driver' => $this->driverDashboard($user),
        };
    }

    private function distributorDashboard(): array
    {
        return \Cache::remember('dashboard_distributor', 300, function () {
            $totalOrders = Order::count();
            $pendingOrders = Order::where('status', 'pending')->count();
            $totalRevenue = Order::whereNotIn('status', ['cancelled'])->sum('total_amount');
            $totalProducts = Product::active()->count();
            $lowStockCount = Product::lowStock()->count();
            $activeDrivers = User::where('role', 'driver')->where('is_active', true)->count();

            $recentOrders = Order::with('retailer:id,name')
                ->select('id', 'order_number', 'retailer_id', 'total_amount', 'status', 'created_at')
                ->latest()->take(5)->get()
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'retailer' => $o->retailer?->name ?? 'Unknown',
                    'total_amount' => (float) $o->total_amount,
                    'status' => $o->status,
                    'created_at' => $o->created_at->format('Y-m-d H:i'),
                ]);

            $monthlySales = Order::selectRaw('MONTH(created_at) as month, SUM(total_amount) as total')
                ->whereYear('created_at', date('Y'))
                ->whereNotIn('status', ['cancelled'])
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return response()->json([
                'stats' => compact('totalOrders', 'pendingOrders', 'totalRevenue', 'totalProducts', 'lowStockCount', 'activeDrivers'),
                'recent_orders' => $recentOrders,
                'monthly_sales' => $monthlySales,
            ])->getData(true);
        });
    }

    private function retailerDashboard(User $user): array
    {
        $uid = $user->id;

        return \Cache::remember("dashboard_retailer_{$uid}", 300, function () use ($uid) {
            $myOrders = Order::where('retailer_id', $uid)->count();
            $pendingOrders = Order::where('retailer_id', $uid)->where('status', 'pending')->count();
            $totalSpent = Order::where('retailer_id', $uid)->whereNotIn('status', ['cancelled'])->sum('total_amount');
            $activeDelivery = Delivery::whereHas('order', fn ($q) => $q->where('retailer_id', $uid))
                ->whereIn('status', ['assigned', 'picked_up', 'on_the_way'])->first();

            $recentOrders = Order::with('delivery')
                ->where('retailer_id', $uid)
                ->latest()->take(5)->get()
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'total_amount' => (float) $o->total_amount,
                    'status' => $o->status,
                    'created_at' => $o->created_at->format('Y-m-d H:i'),
                ]);

            return response()->json([
                'stats' => compact('myOrders', 'pendingOrders', 'totalSpent'),
                'active_delivery' => $activeDelivery?->load('order'),
                'recent_orders' => $recentOrders,
            ])->getData(true);
        });
    }

    private function driverDashboard(User $user): array
    {
        $totalDeliveries = Delivery::where('driver_id', $user->id)->count();
        $todayDeliveries = Delivery::where('driver_id', $user->id)->whereDate('created_at', today())->count();
        $completedDeliveries = Delivery::where('driver_id', $user->id)->where('status', 'delivered')->count();
        $activeDelivery = Delivery::with('order.retailer')
            ->where('driver_id', $user->id)->whereIn('status', ['assigned', 'picked_up', 'on_the_way'])->first();

        return response()->json([
            'stats' => compact('totalDeliveries', 'todayDeliveries', 'completedDeliveries'),
            'active_delivery' => $activeDelivery,
        ])->getData(true);
    }

    public function salesReport(Request $request)
    {
        $year = $request->year ?? date('Y');
        $month = $request->month ?? null;

        $query = Order::selectRaw('DATE(created_at) as date, COUNT(*) as total_orders, SUM(total_amount) as revenue')
            ->whereNotIn('status', ['cancelled'])
            ->whereYear('created_at', $year);

        if ($month) {
            $query->whereMonth('created_at', $month);
        }

        $data = $query->groupBy('date')->orderBy('date')->get();

        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->selectRaw('products.name, SUM(order_items.quantity) as total_qty, SUM(order_items.subtotal) as total_revenue')
            ->whereNotIn('orders.status', ['cancelled'])
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->get();

        return response()->json(compact('data', 'topProducts'));
    }

    public function deliveryReport(Request $request)
    {
        $deliveries = Delivery::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')->get();

        $driverPerformance = Delivery::with('driver')
            ->selectRaw("driver_id, COUNT(*) as total, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered")
            ->groupBy('driver_id')
            ->get()
            ->map(fn ($d) => [
                'driver' => $d->driver?->name,
                'total' => $d->total,
                'delivered' => $d->delivered,
                'success_rate' => $d->total > 0 ? round(($d->delivered / $d->total) * 100, 1) : 0,
            ]);

        return response()->json(compact('deliveries', 'driverPerformance'));
    }
}
