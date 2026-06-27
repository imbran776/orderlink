<?php

use Illuminate\Support\Facades\Route;

// OrderLink menggunakan API-only mode
// Semua route ada di routes/api.php dengan prefix /api
// File ini wajib ada agar Laravel tidak error saat boot

Route::get('/', function () {
    return response()->json([
        'app' => 'OrderLink API',
        'version' => '1.0.0',
        'status' => 'running',
        'docs' => '/api',
    ]);
});
