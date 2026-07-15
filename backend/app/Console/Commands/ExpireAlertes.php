<?php

namespace App\Console\Commands;

use App\Events\AlerteSupprimee;
use App\Models\Alerte;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:expire-alertes')]
#[Description('Expire les alertes dont la date d\'expiration est dépassée')]
class ExpireAlertes extends Command
{
    public function handle(): void
    {
        // Récupérer les IDs avant la mise à jour pour pouvoir diffuser les événements
        $alertesExpirees = Alerte::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->pluck('id');

        if ($alertesExpirees->isEmpty()) {
            $this->info('0 alerte(s) expirée(s).');
            return;
        }

        // Mettre à jour le statut
        Alerte::whereIn('id', $alertesExpirees)->update(['status' => 'expired']);

        // Diffuser un événement pour chaque alerte expirée
        foreach ($alertesExpirees as $alerteId) {
            broadcast(new AlerteSupprimee($alerteId));
        }

        $this->info("{$alertesExpirees->count()} alerte(s) expirée(s).");
    }
}
