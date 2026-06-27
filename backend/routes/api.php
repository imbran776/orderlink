<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| OrderLink API Routes
|--------------------------------------------------------------------------
| Prefix: /api
| Auth: Laravel Sanctum (Bearer Token)
| Roles: distributor | retailer | driver
|--------------------------------------------------------------------------
*/
// ── Public Routes ─────────────────────────────────────────────────────────────

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

// Health check (public, untuk UptimeRobot / monitoring)
Route::get('/health', [HealthController::class, 'index']);
Route::get('/health/errors', [HealthController::class, 'errorLog']);

// ─── Authenticated Routes ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Dashboard (role-aware)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Products (read: all roles) ──────────────────────────────────────────
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductCategoryController::class, 'index']);

    // ── Notifications (static routes MUST come before {notification} param) ──
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // ── Invoices (all roles) ────────────────────────────────────────────────
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download']);

    // ─────────────────────────────────────────────────────────────────────────
    // DISTRIBUTOR ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    Route::middleware('role:distributor')->group(function () {

        // Product management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);

        // Category management
        Route::post('/categories', [ProductCategoryController::class, 'store']);
        Route::put('/categories/{category}', [ProductCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [ProductCategoryController::class, 'destroy']);

        // Stock management
        Route::get('/stocks', [StockController::class, 'index']);
        Route::post('/stocks/adjustment', [StockController::class, 'adjustment']);
        Route::get('/stocks/low-stock', [StockController::class, 'lowStock']);
        Route::get('/stocks/{product}/movements', [StockController::class, 'movements']);

        // Order management (all orders)
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::post('/orders/{order}/assign-driver', [OrderController::class, 'assignDriver']);

        // Delivery management
        Route::get('/deliveries', [DeliveryController::class, 'index']);
        Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);

        // Reports
        Route::get('/reports/sales', [DashboardController::class, 'salesReport']);
        Route::get('/reports/delivery', [DashboardController::class, 'deliveryReport']);

        // Driver list
        Route::get('/drivers', [AuthController::class, 'drivers']);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // RETAILER ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    Route::middleware('role:retailer')->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/my-orders', [OrderController::class, 'myOrders']);
        Route::get('/my-orders/{order}', [OrderController::class, 'showMyOrder']);
        Route::delete('/orders/{order}', [OrderController::class, 'cancel']);

        // Real-time tracking
        Route::get('/tracking/{order}', [DeliveryController::class, 'tracking']);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // DRIVER ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    Route::middleware('role:driver')->group(function () {
        Route::get('/my-deliveries', [DeliveryController::class, 'myDeliveries']);
        Route::get('/my-deliveries/{delivery}', [DeliveryController::class, 'showMyDelivery']);
        Route::put('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
        Route::post('/deliveries/{delivery}/proof', [DeliveryController::class, 'uploadProof']);
        Route::post('/deliveries/{delivery}/location', [DeliveryController::class, 'updateLocation']);
    });
});
