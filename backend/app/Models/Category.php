<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'active',
    ];

    public function getActiveAttribute(): bool
    {
        return (bool) $this->is_active;
    }

    public function typeIncidents(): HasMany
    {
        return $this->hasMany(TypeIncident::class);
    }

    public function alertes(): HasMany
    {
        return $this->hasMany(Alerte::class);
    }
}
