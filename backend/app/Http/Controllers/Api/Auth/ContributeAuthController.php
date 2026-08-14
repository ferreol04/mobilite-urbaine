<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\MagicLoginMail;
use App\Mail\VerificationMail;
use App\Models\User;
use App\Models\VerificationToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ContributeAuthController extends Controller
{
    /**
     * Étape 1 : L'utilisateur fournit son email.
     * Le système détecte s'il existe déjà et retourne le statut du compte.
     */
    public function identify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'pending_contribution' => ['nullable', 'array'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Compte inexistant — envoi du lien de vérification pour créer le compte
            return $this->sendVerificationLink(
                $request->email,
                'account_verification',
                $request->pending_contribution
            );
        }

        // Compte existant — vérifier le statut
        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Votre compte n\'est pas encore activé. Veuillez vérifier votre boîte email pour activer votre compte.',
            ], 403);
        }

        if ($user->role === 'user' && $user->status !== 'active') {
            return response()->json([
                'message' => 'Votre compte est suspendu ou banni.',
            ], 403);
        }

        // Le compte a un mot de passe
        if ($user->has_password) {
            return response()->json([
                'status'    => 'has_password',
                'message'   => 'Compte identifié.',
                'has_password' => true,
            ]);
        }

        // Le compte n'a pas de mot de passe — envoi du lien de connexion
        return $this->sendVerificationLink(
            $request->email,
            'magic_login',
            $request->pending_contribution
        );
    }

    /**
     * Connexion par mot de passe (pour les comptes qui en ont un).
     */
    public function loginWithPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
            'pending_contribution' => ['nullable', 'array'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 401);
        }

        if ($user->role === 'user' && $user->status !== 'active') {
            return response()->json(['message' => 'Votre compte est suspendu ou banni.'], 403);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'status'  => 'authenticated',
            'message' => 'Connexion réussie.',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * Envoyer un lien de connexion (magic link) pour un compte existant.
     */
    public function sendMagicLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'pending_contribution' => ['nullable', 'array'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->role === 'user' && $user->status !== 'active') {
            return response()->json(['message' => 'Votre compte est suspendu ou banni.'], 403);
        }

        return $this->sendVerificationLink(
            $request->email,
            'magic_login',
            $request->pending_contribution
        );
    }

    /**
     * Vérification du token reçu par email.
     * Crée le compte si nécessaire, ouvre la session.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string', 'size:64'],
        ]);

        $verification = VerificationToken::where('token', $request->token)->first();

        if (!$verification) {
            return response()->json([
                'message' => 'Ce lien de vérification est invalide.',
            ], 422);
        }

        if ($verification->used) {
            return response()->json([
                'message' => 'Ce lien de vérification a déjà été utilisé.',
                'reason'  => 'used',
            ], 422);
        }

        if ($verification->expires_at->isPast()) {
            return response()->json([
                'message'   => 'Ce lien de vérification a expiré. Veuillez en demander un nouveau.',
                'reason'    => 'expired',
                // Renvoyé uniquement pour permettre au frontend de proposer un renvoi
                // d'email sans redemander la saisie à l'utilisateur.
                'email'     => $verification->type === 'registration_verification' ? $verification->email : null,
                'resendable' => $verification->type === 'registration_verification',
            ], 422);
        }

        // Marquer comme utilisé
        $verification->update(['used' => true]);

        if ($verification->type === 'account_verification') {
            // Créer le compte (contribution rapide sans compte)
            $user = User::create([
                'email'                  => $verification->email,
                'pseudo'                 => User::generatePseudo(),
                'display_name_preference' => 'pseudo',
                'has_password'           => false,
                'role'                   => 'user',
                'status'                 => 'active',
                'registration_date'      => now(),
            ]);
        } elseif ($verification->type === 'registration_verification') {
            // Inscription classique — le compte n'existe pas encore, on le crée maintenant
            if (User::where('email', $verification->email)->exists()) {
                return response()->json(['message' => 'Un compte existe déjà avec cet email.'], 409);
            }

            $data = $verification->pending_contribution ?? [];

            if (!empty($data['phone']) && User::where('phone', $data['phone'])->exists()) {
                return response()->json(['message' => 'Ce numéro de téléphone est déjà utilisé.'], 409);
            }

            $user = User::create([
                'last_name'               => $data['last_name'] ?? null,
                'first_name'              => $data['first_name'] ?? null,
                'pseudo'                  => User::generatePseudo(),
                'display_name_preference' => 'real_name',
                'gender'                  => $data['gender'] ?? null,
                'email'                   => $verification->email,
                'phone'                   => $data['phone'] ?? null,
                'password'                => $data['password'] ?? null,
                'has_password'            => true,
                'role'                    => 'user',
                'status'                  => 'active',
                'registration_date'       => now(),
            ]);
        } else {
            // magic_login — récupérer le compte existant
            $user = User::where('email', $verification->email)->first();

            if (!$user) {
                return response()->json(['message' => 'Compte introuvable.'], 404);
            }
        }

        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        // Pour 'registration_verification', pending_contribution contenait les données
        // d'inscription (déjà consommées ci-dessus pour créer le compte) — ce n'est pas
        // une contribution à soumettre, donc on ne le renvoie pas dans ce cas.
        $pendingContribution = $verification->type === 'registration_verification'
            ? null
            : $verification->pending_contribution;

        return response()->json([
            'status'               => 'authenticated',
            'message'              => 'Vérification réussie.',
            'user'                 => $user,
            'token'                => $token,
            'is_new_account'       => $verification->type === 'account_verification',
            'pending_contribution' => $pendingContribution,
        ]);
    }

    /**
     * Définir un mot de passe (pour les comptes créés sans mot de passe).
     */
    public function setPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = $request->user();

        if ($user->has_password) {
            return response()->json([
                'message' => 'Vous avez déjà un mot de passe. Utilisez la modification de mot de passe.',
            ], 422);
        }

        $user->update([
            'password'     => $request->password,
            'has_password' => true,
        ]);

        return response()->json([
            'message' => 'Votre mot de passe a été enregistré avec succès. Vous pourrez désormais vous connecter soit avec votre mot de passe, soit en utilisant un lien de connexion.',
        ]);
    }

    /**
     * Vérifier si la bannière "Définir un mot de passe" doit être affichée.
     */
    public function passwordSuggestionStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        $shouldSuggest = !$user->has_password
            && (
                is_null($user->password_suggested_at)
                || $user->password_suggested_at->diffInDays(now()) >= 3
            );

        return response()->json([
            'should_suggest_password' => $shouldSuggest,
        ]);
    }

    /**
     * L'utilisateur ferme la bannière — on enregistre la date.
     */
    public function dismissPasswordSuggestion(Request $request): JsonResponse
    {
        $request->user()->update(['password_suggested_at' => now()]);

        return response()->json(['message' => 'OK']);
    }

    /**
     * Confirmer la suppression de compte via token email.
     */
    public function confirmDelete(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string', 'size:64'],
        ]);

        $verification = VerificationToken::where('token', $request->token)
            ->where('type', 'account_deletion')
            ->first();

        if (!$verification) {
            return response()->json([
                'message' => 'Ce lien de confirmation est invalide.',
            ], 422);
        }

        if ($verification->used) {
            return response()->json([
                'message' => 'Ce lien de confirmation a déjà été utilisé.',
            ], 422);
        }

        if ($verification->expires_at->isPast()) {
            return response()->json([
                'message' => 'Ce lien de confirmation a expiré. Veuillez en demander un nouveau.',
            ], 422);
        }

        $verification->update(['used' => true]);

        $user = User::where('email', $verification->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Compte introuvable.'], 404);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Votre compte a été supprimé avec succès.']);
    }

    /**
     * Génère et envoie un lien de vérification par email.
     */
    private function sendVerificationLink(string $email, string $type, ?array $pendingContribution): JsonResponse
    {
        // Invalider les tokens précédents non utilisés
        VerificationToken::where('email', $email)
            ->where('type', $type)
            ->where('used', false)
            ->update(['used' => true]);

        $token = Str::random(64);

        VerificationToken::create([
            'email'                => $email,
            'token'                => $token,
            'type'                 => $type,
            'pending_contribution' => $pendingContribution,
            'expires_at'           => now()->addMinutes(30),
        ]);

        // Envoyer l'email
        $mailClass = $type === 'account_verification'
            ? VerificationMail::class
            : MagicLoginMail::class;

        Mail::to($email)->send(new $mailClass($token));

        $message = $type === 'account_verification'
            ? 'Nous venons de vous envoyer un lien de vérification. Veuillez confirmer votre identité afin de finaliser votre contribution.'
            : 'Nous venons de vous envoyer un lien de connexion. Veuillez cliquer sur le lien pour vous connecter.';

        return response()->json([
            'status'  => 'verification_sent',
            'message' => $message,
        ]);
    }
}
