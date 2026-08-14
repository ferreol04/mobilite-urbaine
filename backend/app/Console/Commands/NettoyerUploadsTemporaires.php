<?php

namespace App\Console\Commands;

use App\Models\TempUpload;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('app:nettoyer-uploads-temporaires')]
#[Description('Supprime les photos temporaires (temp_alertes) jamais rattachées à une alerte, au-delà de 2h')]
class NettoyerUploadsTemporaires extends Command
{
    // Durée de rétention avant suppression : le temps de créer un compte,
    // vérifier son email et finaliser sa contribution est largement couvert.
    private const RETENTION_HOURS = 2;

    public function handle(): void
    {
        $disk = Storage::disk('public');

        if (!$disk->exists('temp_alertes')) {
            $this->info('0 fichier(s) supprimé(s).');
            return;
        }

        $seuil = now()->subHours(self::RETENTION_HOURS)->timestamp;
        $supprimes = 0;

        foreach ($disk->files('temp_alertes') as $fichier) {
            if ($disk->lastModified($fichier) < $seuil) {
                $disk->delete($fichier);
                TempUpload::where('path', $fichier)->delete();
                $supprimes++;
            }
        }

        // Filet de sécurité : lignes orphelines (fichier déjà supprimé autrement)
        TempUpload::where('created_at', '<', now()->subHours(self::RETENTION_HOURS))->delete();

        $this->info("{$supprimes} fichier(s) temporaire(s) supprimé(s).");
    }
}
