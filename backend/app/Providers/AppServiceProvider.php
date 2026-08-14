<?php

namespace App\Providers;

use App\Models\Alerte;
use App\Observers\AlerteObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Alerte::observe(AlerteObserver::class);

        // L'URL de réinitialisation est désormais construite directement dans
        // User::sendPasswordResetNotification() (voir ResetPasswordMail), qui
        // envoie un email personnalisé au lieu de la notification native.
    }
}
