<?php

use Illuminate\Support\Facades\Route;

// Menyajikan React SPA untuk semua rute non-API
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|storage).*$');
