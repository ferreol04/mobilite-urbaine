<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use App\Models\TypeIncident;
use App\Models\ZoneARisque;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoneARisqueController extends Controller
{
    // Correspondance zone_type → noms des types d'incidents concernés
    private const ZONE_TYPE_INCIDENTS = [
        'accident_prone' => ['Accident de circulation'],
        'congested'      => ['Gros embouteillage'],
        'flood_prone'    => ['Route inondée'],
    ];

    public function index(Request $request): JsonResponse
    {
        $query = ZoneARisque::query();

        if ($request->filled('zone_type')) {
            $query->where('zone_type', $request->zone_type);
        }
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        return response()->json($query->orderByDesc('incident_count')->get());
    }

    public function show(ZoneARisque $zoneARisque): JsonResponse
    {
        return response()->json($zoneARisque);
    }

    /**
     * GET /zones-a-risque/{id}/alertes
     * Retourne uniquement les accidents dans le rayon de la zone (paramètre rayon_zone_risque).
     */
    public function alertes(ZoneARisque $zoneARisque): JsonResponse
    {
        $typeNames = self::ZONE_TYPE_INCIDENTS[$zoneARisque->zone_type] ?? [];
        $typeIds   = TypeIncident::whereIn('name', $typeNames)->pluck('id');

        $params = \App\Models\Parametre::whereIn('key', ['rayon_zone_risque', 'jours_analyse_zone'])
            ->pluck('value', 'key');

        $degres = (float) $params['rayon_zone_risque'] / 111000;
        $depuis = now()->subDays((int) $params['jours_analyse_zone']);

        $alertes = Alerte::withTrashed()->with([
                'user:id,last_name,first_name,gender',
                'category:id,name',
                'typeIncident:id,name,icon,disappearance_mode',
                'medias:id,alerte_id,url',
            ])
            ->whereIn('type_incident_id', $typeIds)
            ->where('reported_at', '>=', $depuis)
            ->whereBetween('latitude',  [$zoneARisque->latitude  - $degres, $zoneARisque->latitude  + $degres])
            ->whereBetween('longitude', [$zoneARisque->longitude - $degres, $zoneARisque->longitude + $degres])
            ->latest('reported_at')
            ->get();

        return response()->json($alertes);
    }
}
