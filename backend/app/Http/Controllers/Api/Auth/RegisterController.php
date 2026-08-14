<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationMail;
use App\Models\VerificationToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'last_name'  => ['required', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:100'],
            'gender'     => ['required', 'in:male,female'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password'   => ['required', 'confirmed', Password::min(8)],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Le compte n'est pas créé maintenant : on garde les infos dans le token
        // de vérification, et le User n'est créé qu'au moment où le lien est
        // cliqué (voir ContributeAuthController::verify). Ça évite d'accumuler
        // des comptes 'pending' pour des inscriptions jamais confirmées.

        // Invalider les demandes d'inscription précédentes non utilisées pour cet email
        VerificationToken::where('email', $request->email)
            ->where('type', 'registration_verification')
            ->where('used', false)
            ->update(['used' => true]);

        $token = Str::random(64);

        VerificationToken::create([
            'email'                => $request->email,
            'token'                => $token,
            'type'                 => 'registration_verification',
            'pending_contribution' => [
                'last_name'  => $request->last_name,
                'first_name' => $request->first_name,
                'gender'     => $request->gender,
                'phone'      => $request->phone,
                'password'   => Hash::make($request->password),
            ],
            'expires_at' => now()->addMinutes(30),
        ]);

        // Envoyer l'email de vérification
        Mail::to($request->email)->send(new VerificationMail($token, 30, 'registration'));

        return response()->json([
            'status'  => 'verification_sent',
            'message' => 'Un email de vérification a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.',
        ], 201);
    }
}
