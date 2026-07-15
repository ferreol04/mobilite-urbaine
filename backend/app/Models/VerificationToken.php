<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationToken extends Model
{
    protected $fillable = [
        'email',
        'token',
        'type',
        'pending_contribution',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'pending_contribution' => 'array',
        'expires_at'           => 'datetime',
        'used'                 => 'boolean',
    ];

    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }
}
