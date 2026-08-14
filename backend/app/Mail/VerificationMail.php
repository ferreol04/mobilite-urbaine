<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param string $context 'registration' (inscription classique) ou
     *                        'contribution' (compte créé pour finaliser une contribution)
     */
    public function __construct(
        public string $token,
        public int $expiresInMinutes = 30,
        public string $context = 'contribution',
    ) {
    }

    public function envelope(): Envelope
    {
        $subject = $this->context === 'registration'
            ? 'Activez votre compte — Mobilité Urbaine'
            : 'Vérifiez votre identité — Mobilité Urbaine';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification',
            with: [
                'verificationUrl'  => config('app.frontend_url') . '/verify?token=' . $this->token,
                'expiresInMinutes' => $this->expiresInMinutes,
                'context'          => $this->context,
            ],
        );
    }
}
