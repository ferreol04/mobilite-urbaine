<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event diffusé lorsqu'une alerte est supprimée ou expire.
 */
class AlerteSupprimee implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $alerteId;

    public function __construct(int $alerteId)
    {
        $this->alerteId = $alerteId;
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
        return 'AlerteSupprimee';
    }

    /**
     * Données diffusées.
     */
    public function broadcastWith(): array
    {
        return ['id' => $this->alerteId];
    }
}
