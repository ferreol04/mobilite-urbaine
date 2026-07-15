<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $token)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Vérifiez votre identité — Mobilité Urbaine',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification',
            with: [
                'verificationUrl' => config('app.frontend_url') . '/verify?token=' . $this->token,
            ],
        );
    }
}
