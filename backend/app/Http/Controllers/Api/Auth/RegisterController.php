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

        // Créer le compte avec status 'pending'
        $user = User::create([
            'last_name'              => $request->last_name,
            'first_name'             => $request->first_name,
            'pseudo'                 => User::generatePseudo(),
            'display_name_preference' => 'real_name',
            'gender'                 => $request->gender,
            'email'                  => $request->email,
            'phone'                  => $request->phone,
            'password'               => $request->password,
            'has_password'           => true,
            'role'                   => 'user',
            'status'                 => 'pending',
            'registration_date'      => now(),
        ]);

        // Générer un token de vérification
        $token = Str::random(64);

        VerificationToken::create([
            'email'      => $user->email,
            'token'      => $token,
            'type'       => 'registration_verification',
            'expires_at' => now()->addMinutes(60),
        ]);

        // Envoyer l'email de vérification
        Mail::to($user->email)->send(new VerificationMail($token));

        return response()->json([
            'status'  => 'verification_sent',
            'message' => 'Votre compte a été créé. Un email de vérification a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.',
        ], 201);
    }
}
