<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountDeletionMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public string $token)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmation de suppression de compte — Mobilité Urbaine',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-deletion',
            with: [
                'deletionUrl' => config('app.frontend_url') . '/confirm-delete?token=' . $this->token,
            ],
        );
    }
}
