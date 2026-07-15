<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vérification des alertes expirées toutes les minutes
Schedule::command('app:expire-alertes')->everyMinute();

// Recalcul des zones à risque toutes les heures
Schedule::command('app:calculer-zones-a-risque')->hourly();
