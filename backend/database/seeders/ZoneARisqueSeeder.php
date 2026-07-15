<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class ZoneARisqueSeeder extends Seeder
{
    /**
     * Calcule les zones à risque depuis les vraies alertes en base.
     * Doit être exécuté APRÈS AlerteSeeder.
     */
    public function run(): void
    {
        Artisan::call('app:calculer-zones-a-risque');

        $this->command->info(Artisan::output());
    }
}
