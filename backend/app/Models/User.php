<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'last_name',
        'first_name',
        'pseudo',
        'display_name_preference',
        'gender',
        'email',
        'phone',
        'password',
        'has_password',
        'password_suggested_at',
        'role',
        'status',
        'registration_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password'              => 'hashed',
        'has_password'          => 'boolean',
        'password_suggested_at' => 'datetime',
        'registration_date'     => 'datetime',
    ];

    protected $appends = ['display_name'];

    public function getDisplayNameAttribute(): string
    {
        if ($this->display_name_preference === 'pseudo' || !$this->first_name && !$this->last_name) {
            return $this->pseudo ?? 'Contributeur';
        }

        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    public static function generatePseudo(): string
    {
        do {
            $number = random_int(10, 99999);
            $pseudo = 'User' . $number;
        } while (static::where('pseudo', $pseudo)->exists());

        return $pseudo;
    }

    public function alertes(): HasMany
    {
        return $this->hasMany(Alerte::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }
}
