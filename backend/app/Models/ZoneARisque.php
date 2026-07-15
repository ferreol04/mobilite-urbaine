<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZoneARisque extends Model
{
    protected $table = 'zones_a_risque';

    protected $fillable = [
        'zone_type',
        'latitude',
        'longitude',
        'city',
        'district',
        'incident_count',
        'periods_distribution',
    ];

    protected $casts = [
        'latitude'             => 'float',
        'longitude'            => 'float',
        'incident_count'       => 'integer',
        'periods_distribution' => 'array',
    ];
}
