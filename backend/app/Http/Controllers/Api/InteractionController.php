<?php

namespace App\Http\Controllers\Api;

use App\Events\AlerteMiseAJour;
use App\Events\AlerteSupprimee;
use App\Http\Controllers\Controller;
use App\Models\Alerte;
use App\Models\Interaction;
use App\Models\Parametre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    public function store(Request $request, Alerte $alerte): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'in:confirmation,false,resolved'],
        ]);

        if ($alerte->status !== 'active') {
            return response()->json(['message' => 'Cette alerte n\'est plus active.'], 422);
        }

        // L'auteur ne peut pas confirmer ni signaler comme fausse sa propre alerte
        if ($alerte->user_id === $request->user()->id && in_array($request->type, ['confirmation', 'false'])) {
            return response()->json(['message' => 'Vous ne pouvez pas effectuer cette action sur votre propre alerte.'], 403);
        }

        $userId = $request->user()->id;
        $type   = $request->type;

        if ($type === 'false') {
            // Une seule fois par alerte
            $dejaSoumis = Interaction::where('alerte_id', $alerte->id)
                ->where('user_id', $userId)
                ->where('type', 'false')
                ->exists();

            if ($dejaSoumis) {
                return response()->json(['message' => 'Vous avez déjà signalé cette alerte comme fausse.'], 422);
            }
        } else {
            // Délai minimum entre deux interactions du même type
            $delaiInteraction = (int) Parametre::where('key', 'delai_interaction')->value('value');
            $derniereInteraction = Interaction::where('alerte_id', $alerte->id)
                ->where('user_id', $userId)
                ->where('type', $type)
                ->latest('interacted_at')
                ->first();

            if ($derniereInteraction) {
                $minutesEcoulees = now()->diffInMinutes($derniereInteraction->interacted_at);
                if ($minutesEcoulees < $delaiInteraction) {
                    $disponibleA = $derniereInteraction->interacted_at->addMinutes($delaiInteraction)->format('H\hi');
                    return response()->json([
                        'message' => "Vous pourrez refaire cette interaction à partir de {$disponibleA}.",
                    ], 422);
                }
            }
        }

        Interaction::create([
            'alerte_id'     => $alerte->id,
            'user_id'       => $userId,
            'type'          => $type,
            'interacted_at' => now(),
        ]);

        // Mettre à jour les compteurs et vérifier les seuils
        $this->mettreAJourAlerte($alerte, $type);

        // Diffuser la mise à jour en temps réel
        $alerte->refresh();
        if (in_array($alerte->status, ['resolved', 'false'])) {
            // L'alerte a été résolue ou marquée fausse — la retirer de la carte
            broadcast(new AlerteSupprimee($alerte->id))->toOthers();
        } else {
            broadcast(new AlerteMiseAJour($alerte))->toOthers();
        }

        return response()->json([
            'message' => 'Interaction enregistrée.',
            'alerte'  => $alerte->fresh(),
        ]);
    }

    private function mettreAJourAlerte(Alerte $alerte, string $type): void
    {
        if ($type === 'confirmation') {
            $alerte->increment('confirmation_count');
            $alerte->refresh();

            // Prolongation si plus de la moitié de la durée est écoulée
            if ($alerte->expires_at && $alerte->typeIncident->disappearance_mode === 'automatic') {
                $dureeInitiale   = $alerte->typeIncident->validity_duration; // en minutes
                $moitie          = $dureeInitiale / 2;
                $minutesEcoulees = now()->diffInMinutes($alerte->reported_at);

                if ($minutesEcoulees > $moitie) {
                    $alerte->update(['expires_at' => $alerte->expires_at->addMinutes($moitie)]);
                }
            }
        } elseif ($type === 'resolved') {
            $alerte->increment('resolved_report_count');
            $alerte->refresh();

            $seuil = (int) Parametre::where('key', 'seuil_signalement_termine')->value('value');
            if ($alerte->resolved_report_count >= $seuil) {
                $alerte->update(['status' => 'resolved']);
            }
        } elseif ($type === 'false') {
            $alerte->increment('false_report_count');
            $alerte->refresh();

            $seuil = (int) Parametre::where('key', 'seuil_signalement_fausse')->value('value');
            if ($alerte->false_report_count >= $seuil) {
                $alerte->update(['status' => 'false']);
            }
        }
    }
}