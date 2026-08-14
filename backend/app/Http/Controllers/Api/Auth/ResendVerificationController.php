<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationMail;
use App\Models\User;
use App\Models\VerificationToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ResendVerificationController extends Controller
{
    /**
     * Renvoie l'email de vérification d'inscription, en réutilisant les infos
     * déjà fournies (stockées dans le token précédent), sans faire tout
     * ressaisir à l'utilisateur.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'message' => 'Ce compte est déjà activé. Vous pouvez vous connecter.',
            ], 409);
        }

        $lastToken = VerificationToken::where('email', $request->email)
            ->where('type', 'registration_verification')
            ->where('used', false)
            ->latest()
            ->first();

        if (!$lastToken) {
            return response()->json([
                'message' => 'Aucune demande d\'inscription en attente pour cet email. Veuillez vous réinscrire.',
            ], 404);
        }

        if ($lastToken->created_at->diffInSeconds(now()) < 60) {
            return response()->json([
                'message' => 'Un email vient déjà de vous être envoyé. Veuillez patienter avant de réessayer.',
            ], 429);
        }

        // Invalider l'ancien token et en émettre un nouveau avec les mêmes infos
        $lastToken->update(['used' => true]);

        $token = Str::random(64);

        VerificationToken::create([
            'email'                => $lastToken->email,
            'token'                => $token,
            'type'                 => 'registration_verification',
            'pending_contribution' => $lastToken->pending_contribution,
            'expires_at'           => now()->addMinutes(30),
        ]);

        Mail::to($lastToken->email)->send(new VerificationMail($token, 30, 'registration'));

        return response()->json([
            'status'  => 'verification_sent',
            'message' => 'Un nouvel email de vérification a été envoyé.',
        ]);
    }
}
