<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InternalApiKeyMiddleware
{
    /**
     * Handle an incoming server-to-server request from backend/ to portal/.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = env('INTERNAL_API_SECRET');

        if (empty($expectedKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Internal API key is not configured on portal server.',
            ], 500);
        }

        $providedKey = $request->header('X-Internal-Key') 
            ?? $request->bearerToken() 
            ?? $request->header('X-API-KEY');

        if (!$providedKey || !hash_equals($expectedKey, $providedKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Invalid or missing internal API key.',
            ], 401);
        }

        return $next($request);
    }
}
