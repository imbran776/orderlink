<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ── Daftarkan alias middleware CheckRole ─────────────────────────────
        // Tanpa ini 'role:distributor' di api.php tidak akan dikenali → 500 error
        $middleware->alias([
            'role' => CheckRole::class,
        ]);

        // ── CORS untuk semua API request ─────────────────────────────────────
        $middleware->api(prepend: [
            HandleCors::class,
        ]);

        // ── Security Headers via middleware alias ────────────────────────────
        $middleware->api(prepend: [
            SecurityHeaders::class,
        ]);

        // ── Trust semua proxies (untuk deployment di Railway/VPS) ────────────
        $middleware->trustProxies(at: '*');

    })
    ->withExceptions(function (Exceptions $exceptions) {

        // ── Handle unauthenticated (401) untuk API routes ────────────────────
        $exceptions->renderable(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        // ── Return JSON untuk semua error di API routes ──────────────────────
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                return response()->json([
                    'message' => $e->getMessage() ?: 'Terjadi kesalahan server.',
                ], $status);
            }
        });

    })->create();
