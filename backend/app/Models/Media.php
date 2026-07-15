<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    protected $table = 'medias';

    protected $fillable = [
        'alerte_id',
        'url',
    ];

    public function alerte(): BelongsTo
    {
        return $this->belongsTo(Alerte::class);
    }
}
