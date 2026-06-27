<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Role Anda tidak memiliki izin untuk mengakses resource ini.',
                'your_role' => $request->user()->role,
                'required_role' => $roles,
            ], 403);
        }

        return $next($request);
    }
}
