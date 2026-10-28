import * as React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { env } from '@/lib/env';

export interface WhatsAppButtonProps {
  productName: string;
  productSlug: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'outline' | 'default' | 'secondary';
}

export function WhatsAppButton({
  productName,
  productSlug,
  className,
  size = 'default',
  variant = 'outline',
}: WhatsAppButtonProps) {
  const whatsappNumber = '923111257119'; // Business number (Section 12)
  const productUrl = `${env.NEXT_PUBLIC_SITE_URL}/products/${productSlug}`;

  const message = [
    `Hi, I'm interested in ${productName}.`,
    `Product link: ${productUrl}`,
    'Could you tell me more about the customization options?',
  ].join('\n');

  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      render={
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
        >
          <MessageCircle className="h-4 w-4 fill-emerald-600/20" />
          <span>Ask on WhatsApp</span>
        </a>
      }
    />
  );
}
