<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MagicLoginMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public string $token)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre lien de connexion — Mobilité Urbaine',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.magic-login',
            with: [
                'loginUrl' => config('app.frontend_url') . '/verify?token=' . $this->token,
            ],
        );
    }
}
