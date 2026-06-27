<?php

return [
    'default' => env('CACHE_DRIVER', 'file'),
    'stores' => [
        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
            'lock_path' => storage_path('framework/cache/data'),
        ],
        'array' => ['driver' => 'array', 'serialize' => false],
        'database' => ['driver' => 'database', 'table' => 'cache', 'connection' => null, 'lock_connection' => null],
        'redis' => ['driver' => 'redis', 'connection' => 'cache', 'lock_connection' => 'default'],
    ],
    'prefix' => env('CACHE_PREFIX', 'orderlink_cache'),
];
