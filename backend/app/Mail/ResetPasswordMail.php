<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public string $resetUrl, public int $expiresInMinutes)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Réinitialisation de votre mot de passe — Mobilité Urbaine',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password',
            with: [
                'resetUrl'         => $this->resetUrl,
                'expiresInMinutes' => $this->expiresInMinutes,
            ],
        );
    }
}
