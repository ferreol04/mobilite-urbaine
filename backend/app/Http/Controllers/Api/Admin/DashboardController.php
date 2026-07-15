<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use App\Models\Category;
use App\Models\Interaction;
use App\Models\TypeIncident;
use App\Models\User;
use App\Models\ZoneARisque;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'alertes' => [
                'total'    => Alerte::count(),
                'active'   => Alerte::where('status', 'active')->count(),
                'expired'  => Alerte::where('status', 'expired')->count(),
                'resolved' => Alerte::where('status', 'resolved')->count(),
                'false'    => Alerte::where('status', 'false')->count(),
            ],
            'users' => [
                'total'     => User::where('role', 'user')->count(),
                'active'    => User::where('role', 'user')->where('status', 'active')->count(),
                'suspended' => User::where('role', 'user')->where('status', 'suspended')->count(),
            ],
            'interactions' => [
                'total'        => Interaction::count(),
                'confirmations' => Interaction::where('type', 'confirmation')->count(),
                'resolved'     => Interaction::where('type', 'resolved')->count(),
                'false'        => Interaction::where('type', 'false')->count(),
            ],
            'categories' => [
                'total_actives'       => Category::where('is_active', true)->count(),
                'total_types_actifs'  => TypeIncident::where('is_active', true)->count(),
            ],
            'zones_a_risque' => [
                'total' => ZoneARisque::count(),
            ],
            'alertes_par_categorie' => Alerte::selectRaw('category_id, count(*) as total')
                ->with('category:id,name')
                ->groupBy('category_id')
                ->get()
                ->map(fn($a) => ['categorie' => $a->category->name, 'total' => $a->total]),
            'alertes_7_derniers_jours' => Alerte::selectRaw('DATE(reported_at) as date, count(*) as total')
                ->where('reported_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ]);
    }
}
