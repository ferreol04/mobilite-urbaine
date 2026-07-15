<?php

namespace App\Services;

use App\Models\Alerte;
use App\Models\Parametre;
use App\Models\TypeIncident;
use App\Models\ZoneARisque;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ZoneARisqueService
{
    public function recalculerTout(): int
    {
        $params = $this->chargerParametres();

        $rayon  = (float) $params['rayon_zone_risque'];
        $degres = $rayon / 111000;
        $depuis = now()->subDays((int) $params['jours_analyse_zone']);
        $seuil  = (int) $params['seuil_accidents_zone'];
        $jours  = (int) $params['jours_distincts_accidents'];

        $typeId = TypeIncident::where('name', 'Accident de circulation')->value('id');

        $alertes = Alerte::withTrashed()->where('type_incident_id', $typeId)
            ->where('reported_at', '>=', $depuis)
            ->get(['id', 'latitude', 'longitude', 'city', 'district', 'reported_at']);

        $clusters = $this->formerClusters($alertes, $degres);

        // Garder uniquement les clusters qui atteignent les seuils
        $clustersValides = array_values(array_filter($clusters, function ($cluster) use ($seuil, $jours) {
            if (count($cluster['alertes']) < $seuil) {
                return false;
            }

            $joursDistincts = collect($cluster['alertes'])
                ->pluck('reported_at')
                ->map(fn ($d) => Carbon::parse($d)->toDateString())
                ->unique()
                ->count();

            return $joursDistincts >= $jours;
        }));

        // Rebuild complet : supprimer toutes les zones accident_prone et recréer
        ZoneARisque::where('zone_type', 'accident_prone')->delete();

        $created = 0;

        foreach ($clustersValides as $cluster) {
            $centreLat = $cluster['latitude'];
            $centreLng = $cluster['longitude'];
            $distribution = $this->calculerDistributionPeriodes($cluster['alertes']);
            $district     = $this->determinerQuartier($cluster['alertes']);

            ZoneARisque::create([
                'zone_type'            => 'accident_prone',
                'latitude'             => $centreLat,
                'longitude'            => $centreLng,
                'city'                 => $cluster['city'],
                'district'             => $district,
                'incident_count'       => count($cluster['alertes']),
                'periods_distribution' => $distribution,
            ]);

            $created++;
        }

        return $created;
    }

    // -------------------------------------------------------------------------

    /**
     * Regroupe les alertes proches en clusters.
     * Le centre de chaque cluster est la moyenne des lat/lng de ses membres.
     */
    private function formerClusters(Collection $alertes, float $degres): array
    {
        $clusters  = [];
        $assignees = [];

        foreach ($alertes as $alerte) {
            if (in_array($alerte->id, $assignees)) {
                continue;
            }

            $membres = $alertes->filter(fn ($a) =>
                abs($a->latitude  - $alerte->latitude)  <= $degres &&
                abs($a->longitude - $alerte->longitude) <= $degres
            );

            foreach ($membres as $m) {
                $assignees[] = $m->id;
            }

            $membresArray = $membres->values()->toArray();

            $clusters[] = [
                'latitude'  => collect($membresArray)->avg('latitude'),
                'longitude' => collect($membresArray)->avg('longitude'),
                'city'      => $alerte->city,
                'alertes'   => $membresArray,
            ];
        }

        return $clusters;
    }

    /**
     * Calcule la répartition des accidents par période de la journée (UTC+1).
     * Retourne un tableau avec le nombre d'accidents par période.
     */
    private function calculerDistributionPeriodes(array $alertes): array
    {
        $distribution = ['morning' => 0, 'afternoon' => 0, 'evening' => 0, 'night' => 0];

        foreach ($alertes as $alerte) {
            $heure = Carbon::parse($alerte['reported_at'])->setTimezone('Africa/Porto-Novo')->hour;

            if ($heure >= 6 && $heure < 12) {
                $distribution['morning']++;
            } elseif ($heure >= 12 && $heure < 18) {
                $distribution['afternoon']++;
            } elseif ($heure >= 18 && $heure < 22) {
                $distribution['evening']++;
            } else {
                $distribution['night']++;
            }
        }

        return $distribution;
    }

    /**
     * Retourne le quartier le plus fréquent parmi les alertes du cluster.
     * Si aucune alerte n'a de quartier, retourne null.
     */
    private function determinerQuartier(array $alertes): ?string
    {
        $quartiers = collect($alertes)
            ->pluck('district')
            ->filter()
            ->countBy()
            ->sortDesc();

        return $quartiers->isNotEmpty() ? $quartiers->keys()->first() : null;
    }

    /**
     * Signature unique d'une position arrondie à 3 décimales (~100m).
     */
    private function signature(float $lat, float $lng): string
    {
        return round($lat, 3) . ',' . round($lng, 3);
    }

    private function chargerParametres(): array
    {
        return Parametre::whereIn('key', [
            'rayon_zone_risque',
            'jours_analyse_zone',
            'seuil_accidents_zone',
            'jours_distincts_accidents',
        ])->pluck('value', 'key')->all();
    }
}
