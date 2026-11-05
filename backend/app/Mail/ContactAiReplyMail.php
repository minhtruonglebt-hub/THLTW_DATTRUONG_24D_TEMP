<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactAiReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $question,
        public string $reply,
    ) {
    }

    public function build(): self
    {
        return $this->subject('Phản hồi liên hệ từ cửa hàng')
            ->view('emails.contact-ai-reply');
    }
}
