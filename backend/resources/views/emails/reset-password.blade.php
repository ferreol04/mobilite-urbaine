<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Réinitialisation de votre mot de passe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">Mobilité Urbaine — Réinitialisation du mot de passe</h2>

    <p>Bonjour,</p>

    <p>Vous avez demandé la réinitialisation du mot de passe de votre compte sur la plateforme Mobilité Urbaine. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>

    <p style="text-align: center; margin: 30px 0;">
        <a href="{{ $resetUrl }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Réinitialiser mon mot de passe
        </a>
    </p>

    <p>Ce lien est valable pendant {{ $expiresInMinutes }} minutes.</p>

    <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Votre mot de passe restera inchangé.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #6b7280;">Mobilité Urbaine — Plateforme d'assistance à la mobilité urbaine au Bénin</p>
</body>
</html>
