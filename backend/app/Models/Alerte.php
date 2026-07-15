<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alerte extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'category_id',
        'type_incident_id',
        'custom_type',
        'description',
        'latitude',
        'longitude',
        'city',
        'district',
        'location_description',
        'status',
        'reported_at',
        'expires_at',
        'confirmation_count',
        'false_report_count',
        'resolved_report_count',
    ];

    protected $casts = [
        'latitude'               => 'float',
        'longitude'              => 'float',
        'reported_at'            => 'datetime',
        'expires_at'             => 'datetime',
        'confirmation_count'     => 'integer',
        'false_report_count'     => 'integer',
        'resolved_report_count'  => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function typeIncident(): BelongsTo
    {
        return $this->belongsTo(TypeIncident::class);
    }

    public function medias(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }
}
