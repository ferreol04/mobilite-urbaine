<?php

namespace App\Observers;

use App\Models\Alerte;

class AlerteObserver
{
    // Le recalcul des zones se fait uniquement via la commande planifiée
    // php artisan app:calculer-zones-a-risque (exécutée toutes les heures, voir routes/console.php)
}
