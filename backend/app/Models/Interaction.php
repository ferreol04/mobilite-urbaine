<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interaction extends Model
{
    protected $fillable = [
        'alerte_id',
        'user_id',
        'type',
        'interacted_at',
    ];

    protected $casts = [
        'interacted_at' => 'datetime',
    ];

    public function alerte(): BelongsTo
    {
        return $this->belongsTo(Alerte::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
