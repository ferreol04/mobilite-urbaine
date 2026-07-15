<?php

namespace App\Events;

use App\Models\Alerte;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event diffusé lorsqu'une alerte est mise à jour (statut, compteurs, etc.).
 */
class AlerteMiseAJour implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Alerte $alerte;

    public function __construct(Alerte $alerte)
    {
        // Charger les relations nécessaires pour le frontend
        $this->alerte = $alerte->loadMissing([
            'category:id,name',
            'typeIncident:id,name,icon',
            'medias:id,alerte_id,url',
            'user:id,last_name,first_name,pseudo,display_name_preference',
        ]);
    }

    /**
     * Canal de diffusion public.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('alertes');
    }

    /**
     * Nom de l'événement côté client.
     */
    public function broadcastAs(): string
    {
        return 'AlerteMiseAJour';
    }

    /**
     * Données diffusées.
     */
    public function broadcastWith(): array
    {
        return ['alerte' => $this->alerte->toArray()];
    }
}
