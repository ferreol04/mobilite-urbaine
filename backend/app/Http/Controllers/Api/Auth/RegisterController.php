<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'last_name'  => ['required', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:100'],
            'gender'     => ['required', 'in:male,female'],
            'email'      => ['nullable', 'email', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password'   => ['required', 'confirmed', Password::min(8)],
        ]);

        // Au moins email ou téléphone requis
        $validator->after(function ($validator) use ($request) {
            if (empty($request->email) && empty($request->phone)) {
                $validator->errors()->add('contact', 'Un email ou un numéro de téléphone est requis.');
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

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
            'status'                 => 'active',
            'registration_date'      => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }
}
