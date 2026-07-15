<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeIncident extends Model
{
    protected $table = 'type_incidents';

    protected $fillable = [
        'category_id',
        'name',
        'icon',
        'disappearance_mode',
        'validity_duration',
        'is_active',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'validity_duration' => 'integer',
    ];

    protected $appends = [
        'active',
    ];

    public function getActiveAttribute(): bool
    {
        return (bool) $this->is_active;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function alertes(): HasMany
    {
        return $this->hasMany(Alerte::class);
    }
}
