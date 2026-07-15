<?php

namespace App\Observers;

use App\Models\Alerte;

class AlerteObserver
{
    // Le recalcul des zones se fait uniquement via la commande nocturne
    // php artisan app:calculer-zones-a-risque (planifiée à minuit)
}
