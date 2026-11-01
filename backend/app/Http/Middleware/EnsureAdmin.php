<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

// Chỉ cho tài khoản có vai_tro = 'admin' đi tiếp (dùng sau auth:sanctum)
class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()?->vai_tro !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền thực hiện thao tác này'], 403);
        }

        return $next($request);
    }
}
