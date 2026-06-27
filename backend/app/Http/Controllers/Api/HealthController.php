<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
        ];

        $healthy = ! in_array(false, array_column($checks, 'status'), true);

        return response()->json([
            'ok' => $healthy,
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            DB::select('SELECT 1');

            return ['status' => true, 'message' => 'Connected'];
        } catch (\Throwable $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    private function checkCache(): array
    {
        try {
            Cache::put('health_check', now(), 10);
            $value = Cache::get('health_check');

            return ['status' => ! is_null($value), 'message' => $value ? 'Read/Write OK' : 'Read failed'];
        } catch (\Throwable $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    private function checkStorage(): array
    {
        try {
            $path = storage_path('app/public');
            $writable = is_writable($path);

            return ['status' => $writable, 'message' => $writable ? 'Writable' : 'Not writable'];
        } catch (\Throwable $e) {
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }

    public function errorLog(): JsonResponse
    {
        // Ambil 50 error terbaru dari log file
        $logPath = storage_path('logs/laravel.log');
        if (! file_exists($logPath)) {
            return response()->json(['errors' => []]);
        }

        $lines = array_reverse(file($logPath));
        $errors = [];
        foreach ($lines as $line) {
            if (strpos($line, '[error]') !== false || strpos($line, '[critical]') !== false) {
                $errors[] = trim($line);
                if (count($errors) >= 50) {
                    break;
                }
            }
        }

        return response()->json(['errors' => $errors]);
    }
}
