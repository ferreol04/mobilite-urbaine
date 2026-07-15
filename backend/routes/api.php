<?php

use App\Http\Controllers\Api\Admin\AlerteController as AdminAlerteController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ParametreController;
use App\Http\Controllers\Api\Admin\TypeIncidentController as AdminTypeIncidentController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AlerteController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ConfigPubliqueController;
use App\Http\Controllers\Api\InteractionController;
use App\Http\Controllers\Api\ZoneARisqueController;
use App\Http\Controllers\Api\Auth\ContributeAuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\TempUploadController;
use Illuminate\Support\Facades\Route;

Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);
Route::post('/forgot-password', ForgotPasswordController::class);
Route::post('/reset-password', ResetPasswordController::class);

// Flow d'authentification intégrée aux contributions
Route::post('/auth/identify', [ContributeAuthController::class, 'identify']);
Route::post('/auth/login-password', [ContributeAuthController::class, 'loginWithPassword']);
Route::post('/auth/send-magic-link', [ContributeAuthController::class, 'sendMagicLink']);
Route::post('/auth/verify', [ContributeAuthController::class, 'verify']);
Route::post('/auth/confirm-delete', [ContributeAuthController::class, 'confirmDelete']);
Route::post('/temp-upload', [TempUploadController::class, 'store']);

// Routes publiques — accessibles visiteur et utilisateur connecté
Route::get('/config', [ConfigPubliqueController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}/type-incidents', [CategoryController::class, 'typeIncidents']);
Route::get('/alertes', [AlerteController::class, 'index']);
Route::get('/alertes/{alerte}', [AlerteController::class, 'show']);

// Zones à risque — consultation libre
Route::get('/zones-a-risque', [ZoneARisqueController::class, 'index']);
Route::get('/zones-a-risque/{zoneARisque}', [ZoneARisqueController::class, 'show']);
Route::get('/zones-a-risque/{zoneARisque}/alertes', [ZoneARisqueController::class, 'alertes']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', LogoutController::class);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);
    Route::post('/profile/request-delete', [ProfileController::class, 'requestDelete']);

    // Définir un mot de passe (comptes sans mot de passe)
    Route::post('/auth/set-password', [ContributeAuthController::class, 'setPassword']);
    // Bannière suggestion mot de passe
    Route::get('/auth/password-suggestion', [ContributeAuthController::class, 'passwordSuggestionStatus']);
    Route::post('/auth/dismiss-password-suggestion', [ContributeAuthController::class, 'dismissPasswordSuggestion']);

    // Alertes
    Route::post('/alertes', [AlerteController::class, 'store']);
    Route::post('/alertes/force', [AlerteController::class, 'forceStore']);
    Route::put('/alertes/{alerte}', [AlerteController::class, 'update']);
    Route::delete('/alertes/{alerte}', [AlerteController::class, 'destroy']);
    Route::get('/my-alertes', [AlerteController::class, 'myAlertes']);

    // Interactions
    Route::post('/alertes/{alerte}/interactions', [InteractionController::class, 'store']);

    // Médias
    Route::delete('/medias/{media}', [MediaController::class, 'destroy']);
});

// Routes admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Tableau de bord
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Gestion des alertes
    Route::get('/alertes', [AdminAlerteController::class, 'index']);
    Route::get('/alertes/{alerte}', [AdminAlerteController::class, 'show']);
    Route::patch('/alertes/{alerte}/status', [AdminAlerteController::class, 'updateStatus']);

    // Gestion des utilisateurs
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::patch('/users/{user}/status', [AdminUserController::class, 'updateStatus']);

    // Gestion des catégories
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);
    Route::patch('/categories/{category}/restore', [AdminCategoryController::class, 'restore']);

    // Gestion des types d'incidents
    Route::get('/type-incidents', [AdminTypeIncidentController::class, 'index']);
    Route::post('/type-incidents', [AdminTypeIncidentController::class, 'store']);
    Route::put('/type-incidents/{typeIncident}', [AdminTypeIncidentController::class, 'update']);
    Route::delete('/type-incidents/{typeIncident}', [AdminTypeIncidentController::class, 'destroy']);
    Route::patch('/type-incidents/{typeIncident}/restore', [AdminTypeIncidentController::class, 'restore']);

    // Paramètres système
    Route::get('/parametres', [ParametreController::class, 'index']);
    Route::put('/parametres/{parametre}', [ParametreController::class, 'update']);
});
