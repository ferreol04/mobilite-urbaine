<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

class ForgotPasswordController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => ['required', 'email', 'exists:users,email'],
            ],
            [
                'email.required' => 'Le champ email est obligatoire.',
                'email.email' => 'L\'adresse email est invalide.',
                'email.exists' => 'Impossible de trouver un compte associé à cette adresse email.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Impossible de trouver un compte associé à cette adresse email.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => 'Un lien de réinitialisation a été envoyé à votre adresse email.']);
    }
}
