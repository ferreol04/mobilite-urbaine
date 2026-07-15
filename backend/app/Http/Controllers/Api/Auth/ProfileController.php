<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\AccountDeletionMail;
use App\Models\VerificationToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'last_name'               => ['sometimes', 'string', 'max:100'],
            'first_name'              => ['sometimes', 'string', 'max:100'],
            'gender'                  => ['sometimes', 'in:male,female'],
            'email'                   => ['nullable', 'email', 'unique:users,email,' . $user->id],
            'phone'                   => ['nullable', 'string', 'max:20', 'unique:users,phone,' . $user->id],
            'display_name_preference' => ['sometimes', 'in:pseudo,real_name'],
        ]);

        // Vérifier qu'au moins un contact reste présent
        $email = $request->has('email') ? $request->email : $user->email;
        $phone = $request->has('phone') ? $request->phone : $user->phone;

        if (empty($email) && empty($phone)) {
            return response()->json(['errors' => ['contact' => 'Un email ou un numéro de téléphone est requis.']], 422);
        }

        $user->update($request->only(['last_name', 'first_name', 'gender', 'email', 'phone', 'display_name_preference']));

        return response()->json($user->fresh());
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        // Si l'utilisateur a déjà un mot de passe, exiger l'ancien
        if ($user->has_password) {
            $request->validate([
                'current_password' => ['required', 'string'],
                'password'         => ['required', 'confirmed', Password::min(8)],
            ]);

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['errors' => ['current_password' => 'Mot de passe actuel incorrect.']], 422);
            }
        } else {
            $request->validate([
                'password' => ['required', 'confirmed', Password::min(8)],
            ]);
        }

        $user->update([
            'password'     => $request->password,
            'has_password' => true,
        ]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        // Si l'utilisateur a un mot de passe, exiger la confirmation
        if ($user->has_password) {
            $request->validate([
                'password' => ['required', 'string'],
            ]);

            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['errors' => ['password' => 'Mot de passe incorrect.']], 422);
            }
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé avec succès.']);
    }

    public function requestDelete(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->email) {
            return response()->json(['message' => 'Aucune adresse email associée à ce compte.'], 422);
        }

        VerificationToken::where('email', $user->email)
            ->where('type', 'account_deletion')
            ->where('used', false)
            ->update(['used' => true]);

        $token = Str::random(64);

        VerificationToken::create([
            'email'      => $user->email,
            'token'      => $token,
            'type'       => 'account_deletion',
            'expires_at' => now()->addMinutes(30),
        ]);

        Mail::to($user->email)->send(new AccountDeletionMail($token));

        return response()->json(['message' => 'Un lien de confirmation vous a été envoyé par email.']);
    }
}
