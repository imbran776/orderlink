<?php

namespace App\Providers;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Slow query logging (>100ms)
        DB::listen(function (QueryExecuted $query) {
            if ($query->time > 100) {
                logger()->warning('Slow Query', [
                    'time' => $query->time.'ms',
                    'sql' => $query->sql,
                ]);
            }
        });

        // Critical auth events → alerts.log
        Event::listen(function (Login $event) {
            Log::channel('alert')->info('auth.login', [
                'user_id' => $event->user?->id,
            ]);
        });
        Event::listen(function (Failed $event) {
            Log::channel('alert')->info('auth.failed', [
                'credentials' => $event->credentials['email'] ?? 'unknown',
            ]);
        });
        Event::listen(function (Logout $event) {
            Log::channel('alert')->info('auth.logout', [
                'user_id' => $event->user?->id,
            ]);
        });
    }
}
