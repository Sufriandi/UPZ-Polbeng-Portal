<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Fields that should NOT be modified.
     */
    protected array $except = [
        'password',
        'password_confirmation',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        if (!empty($input)) {
            $cleaned = $this->cleanArray($input);
            $request->merge($cleaned);
        }

        return $next($request);
    }

    /**
     * Recursively clean array inputs.
     */
    protected function cleanArray(array $data): array
    {
        foreach ($data as $key => $value) {
            if (in_array($key, $this->except, true)) {
                continue;
            }

            if (is_array($value)) {
                $data[$key] = $this->cleanArray($value);
            } elseif (is_string($value)) {
                $data[$key] = $this->cleanString($value);
            }
        }

        return $data;
    }

    /**
     * Clean individual string:
     * - Strip null bytes (anti-SQLi / path traversal)
     * - Strip dangerous script tags (anti-XSS)
     */
    protected function cleanString(string $value): string
    {
        $value = str_replace(chr(0), '', $value);
        $value = preg_replace('/<\s*script\b[^>]*>(.*?)<\s*\/\s*script\s*>/is', '', $value);
        $value = preg_replace('/javascript\s*:/i', '', $value);

        return trim($value);
    }
}
