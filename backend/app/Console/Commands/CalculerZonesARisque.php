<?php

namespace App\Console\Commands;

use App\Services\ZoneARisqueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:calculer-zones-a-risque')]
#[Description('Calcule et met à jour les zones accidentogènes à partir des alertes récentes')]
class CalculerZonesARisque extends Command
{
    public function handle(ZoneARisqueService $service): void
    {
        $this->info('Calcul des zones à risque en cours...');

        $total = $service->recalculerTout();

        $this->info("{$total} zone(s) accidentogène(s) mise(s) à jour.");
    }
}
