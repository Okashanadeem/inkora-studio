'use client';

import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { env } from '@/lib/env';

/**
 * Floating WhatsApp Help Button (Section 12: mobile-friendly & non-blocking)
 */
export function FloatingWhatsAppButton() {
  const whatsappNumber = '923111257119'; // Business number digits-only
  const message = [
    'Hi Inkora Studio, I have a question regarding custom printing.',
    `Website: ${env.NEXT_PUBLIC_SITE_URL}`,
    'Could you please assist me with sizing and artwork specifications?',
  ].join('\n');

  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'floating_widget' }),
    }).catch(() => {});
  };

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-40">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 hover:bg-emerald-700"
        aria-label="Chat on WhatsApp with Inkora Studio"
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </a>
    </aside>
  );
}
