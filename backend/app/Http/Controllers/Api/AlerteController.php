<?php

namespace App\Http\Controllers\Api;

use App\Events\NouvelleAlerte;
use App\Http\Controllers\Controller;
use App\Models\Alerte;
use App\Models\Category;
use App\Models\Parametre;
use App\Models\TempUpload;
use App\Models\TypeIncident;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AlerteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alerte::with(['user:id,last_name,first_name,pseudo,display_name_preference', 'category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url'])
            ->where('status', 'active');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('type_incident_id')) {
            $query->where('type_incident_id', $request->type_incident_id);
        }
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        return response()->json($query->latest('reported_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $isOther = $this->isOtherCategory($request->category_id);

        $rules = [
            'category_id'          => ['required', 'exists:categories,id'],
            'description'          => ['required', 'string', 'max:1000'],
            'latitude'             => ['required', 'numeric', 'between:-90,90'],
            'longitude'            => ['required', 'numeric', 'between:-180,180'],
            'city'                 => ['required', 'string', 'max:100'],
            'district'             => ['nullable', 'string', 'max:100'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'photos'               => ['nullable', 'array', 'max:5'],
            'photos.*'             => ['image', 'max:2048'],
            'temp_photos'          => ['nullable', 'array', 'max:5'],
            // Doit être un chemin retourné par /temp-upload, jamais un chemin arbitraire.
            'temp_photos.*'        => ['string', 'regex:/^temp_alertes\/[a-zA-Z0-9_\-\.]+$/'],
            'upload_token'         => ['required_with:temp_photos', 'nullable', 'string', 'size:40'],
        ];

        if ($isOther) {
            $rules['custom_type'] = ['required', 'string', 'max:150'];
            $rules['type_incident_id'] = ['nullable'];
        } else {
            $rules['type_incident_id'] = ['required', 'exists:type_incidents,id'];
        }

        $request->validate($rules);

        // Vérification doublon (uniquement pour les types prédéfinis)
        if (!$isOther) {
            $doublon = $this->detecterDoublon(
                $request->category_id,
                $request->type_incident_id,
                $request->latitude,
                $request->longitude
            );

            if ($doublon) {
                return response()->json([
                    'doublon'  => true,
                    'message'  => 'Une alerte similaire existe déjà dans cette zone. Veuillez consulter l\'existant.',
                    'alerte'   => $doublon->load(['category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url']),
                ], 409);
            }
        }

        // Expiration automatique uniquement pour les types prédéfinis
        $expiresAt = null;
        if (!$isOther && $request->type_incident_id) {
            $typeIncident = TypeIncident::find($request->type_incident_id);
            if ($typeIncident && $typeIncident->disappearance_mode === 'automatic') {
                $expiresAt = now()->addMinutes($typeIncident->validity_duration);
            }
        }

        $alerte = Alerte::create([
            'user_id'              => $request->user()->id,
            'category_id'          => $request->category_id,
            'type_incident_id'     => $isOther ? null : $request->type_incident_id,
            'custom_type'          => $isOther ? $request->custom_type : null,
            'description'          => $request->description,
            'latitude'             => $request->latitude,
            'longitude'            => $request->longitude,
            'city'                 => $request->city,
            'district'             => $request->district,
            'location_description' => $request->location_description,
            'status'               => 'active',
            'reported_at'          => now(),
            'expires_at'           => $expiresAt,
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('alertes', 'public');
                $alerte->medias()->create(['url' => $path]);
            }
        }

        // Photos pré-uploadées (flow vérification email)
        if ($request->filled('temp_photos')) {
            $this->attacherTempPhotos($alerte, $request->temp_photos, $request->upload_token);
        }

        // Diffuser l'événement en temps réel
        broadcast(new NouvelleAlerte($alerte))->toOthers();

        return response()->json(
            $alerte->load(['category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url']),
            201
        );
    }

    /**
     * Rattache à l'alerte des photos uploadées avant authentification via
     * /temp-upload, en vérifiant qu'elles ont bien été uploadées avec le
     * jeton fourni — empêche un utilisateur de s'approprier une photo
     * uploadée par quelqu'un d'autre en devinant/récupérant son chemin.
     */
    private function attacherTempPhotos(Alerte $alerte, array $tempPhotos, ?string $uploadToken): void
    {
        if (!$uploadToken) {
            return;
        }

        $storage = Storage::disk('public');

        foreach ($tempPhotos as $tempPath) {
            $upload = TempUpload::where('path', $tempPath)
                ->where('token', $uploadToken)
                ->first();

            if (!$upload || !$storage->exists($tempPath)) {
                continue;
            }

            $newPath = 'alertes/' . basename($tempPath);
            $storage->move($tempPath, $newPath);
            $alerte->medias()->create(['url' => $newPath]);
            $upload->delete();
        }
    }

    public function show(Alerte $alerte): JsonResponse
    {
        return response()->json(
            $alerte->load(['user:id,last_name,first_name,pseudo,display_name_preference', 'category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url'])
        );
    }

    public function update(Request $request, Alerte $alerte): JsonResponse
    {
        if ($alerte->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($alerte->status !== 'active') {
            return response()->json(['message' => 'Cette alerte ne peut plus être modifiée.'], 422);
        }

        $delaiModification = (int) Parametre::where('key', 'delai_modification')->value('value');
        if (now()->diffInMinutes($alerte->reported_at) > $delaiModification) {
            return response()->json(['message' => "Le délai de modification de {$delaiModification} minutes est dépassé."], 422);
        }

        $seuilConfirmation = (int) Parametre::where('key', 'seuil_confirmation_modification')->value('value');
        if ($alerte->confirmation_count >= $seuilConfirmation) {
            return response()->json(['message' => 'Cette alerte a été confirmée par trop d\'utilisateurs et ne peut plus être modifiée.'], 422);
        }

        $request->validate([
            'description'          => ['sometimes', 'string', 'max:1000'],
            'district'             => ['nullable', 'string', 'max:100'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'photos_to_delete'     => ['nullable', 'array'],
            'photos_to_delete.*'   => ['integer', 'exists:medias,id'],
            'photos'               => ['nullable', 'array', 'max:5'],
            'photos.*'             => ['image', 'max:2048'],
        ]);

        $alerte->update($request->only(['description', 'district', 'location_description']));

        if ($request->filled('photos_to_delete')) {
            $alerte->medias()->whereIn('id', $request->photos_to_delete)->delete();
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('alertes', 'public');
                $alerte->medias()->create(['url' => $path]);
            }
        }

        return response()->json(
            $alerte->fresh()->load(['category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url'])
        );
    }

    public function myAlertes(Request $request): JsonResponse
    {
        $alertes = Alerte::with(['category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url'])
            ->where('user_id', $request->user()->id)
            ->latest('reported_at')
            ->get();

        return response()->json($alertes);
    }

    public function forceStore(Request $request): JsonResponse
    {
        $isOther = $this->isOtherCategory($request->category_id);

        $rules = [
            'category_id'          => ['required', 'exists:categories,id'],
            'description'          => ['required', 'string', 'max:1000'],
            'latitude'             => ['required', 'numeric', 'between:-90,90'],
            'longitude'            => ['required', 'numeric', 'between:-180,180'],
            'city'                 => ['required', 'string', 'max:100'],
            'district'             => ['nullable', 'string', 'max:100'],
            'location_description' => ['nullable', 'string', 'max:255'],
            'photos'               => ['nullable', 'array', 'max:5'],
            'photos.*'             => ['image', 'max:2048'],
        ];

        if ($isOther) {
            $rules['custom_type'] = ['required', 'string', 'max:150'];
            $rules['type_incident_id'] = ['nullable'];
        } else {
            $rules['type_incident_id'] = ['required', 'exists:type_incidents,id'];
        }

        $request->validate($rules);

        $expiresAt = null;
        if (!$isOther && $request->type_incident_id) {
            $typeIncident = TypeIncident::find($request->type_incident_id);
            if ($typeIncident && $typeIncident->disappearance_mode === 'automatic') {
                $expiresAt = now()->addMinutes($typeIncident->validity_duration);
            }
        }

        $alerte = Alerte::create([
            'user_id'              => $request->user()->id,
            'category_id'          => $request->category_id,
            'type_incident_id'     => $isOther ? null : $request->type_incident_id,
            'custom_type'          => $isOther ? $request->custom_type : null,
            'description'          => $request->description,
            'latitude'             => $request->latitude,
            'longitude'            => $request->longitude,
            'city'                 => $request->city,
            'district'             => $request->district,
            'location_description' => $request->location_description,
            'status'               => 'active',
            'reported_at'          => now(),
            'expires_at'           => $expiresAt,
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('alertes', 'public');
                $alerte->medias()->create(['url' => $path]);
            }
        }

        // Diffuser l'événement en temps réel
        broadcast(new NouvelleAlerte($alerte))->toOthers();

        return response()->json(
            $alerte->load(['category:id,name', 'typeIncident:id,name,icon', 'medias:id,alerte_id,url']),
            201
        );
    }

    public function destroy(Request $request, Alerte $alerte): JsonResponse
    {
        if ($alerte->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($alerte->status === 'active') {
            return response()->json(['message' => 'Impossible de supprimer une alerte encore active.'], 422);
        }

        $alerte->delete(); // soft delete — la ligne reste en base

        return response()->json(['message' => 'Alerte supprimée.']);
    }

    private function isOtherCategory($categoryId): bool
    {
        return Category::where('id', $categoryId)->where('name', 'Autres')->exists();
    }

    private function detecterDoublon(int $categoryId, int $typeIncidentId, float $lat, float $lng): ?Alerte
    {
        $rayon = 0.001; // ~100m en degrés

        return Alerte::where('category_id', $categoryId)
            ->where('type_incident_id', $typeIncidentId)
            ->where('status', 'active')
            ->whereBetween('latitude', [$lat - $rayon, $lat + $rayon])
            ->whereBetween('longitude', [$lng - $rayon, $lng + $rayon])
            ->latest('reported_at')
            ->first();
    }
}
