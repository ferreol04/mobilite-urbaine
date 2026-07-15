<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Méthode HTTP non autorisée pour cette route.'], 405);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $previous = $e->getPrevious();
                $model = $previous instanceof ModelNotFoundException
                    ? class_basename($previous->getModel())
                    : null;

                $messages = [
                    'Alerte'       => 'Alerte introuvable.',
                    'User'         => 'Utilisateur introuvable.',
                    'Category'     => 'Catégorie introuvable.',
                    'TypeIncident' => 'Type d\'incident introuvable.',
                    'Parametre'    => 'Paramètre introuvable.',
                    'Media'        => 'Média introuvable.',
                    'Interaction'  => 'Interaction introuvable.',
                    'ZoneARisque'  => 'Zone à risque introuvable.',
                ];

                return response()->json([
                    'message' => $messages[$model] ?? 'Ressource introuvable.',
                ], 404);
            }
        });
    })->create();
