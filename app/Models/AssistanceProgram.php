<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssistanceProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type', // beasiswa, bantuan_sosial, lainnya
        'program_type', // mandiri, kerjasama
        'partner_name', // e.g. Baznas Provinsi, Baznas Pusat
        'quota',
        'start_date',
        'end_date',
        'status', // draft, opened, closed, completed
        'terms',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'quota' => 'integer',
    ];

    public function requirements(): HasMany
    {
        return $this->hasMany(AssistanceProgramRequirement::class, 'assistance_program_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'assistance_program_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'assistance_program_id');
    }
}
