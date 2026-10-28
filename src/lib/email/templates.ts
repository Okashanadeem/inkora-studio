import { sendTransactionalEmail } from './client';
import { formatPKR } from '@/lib/money';
import { env } from '@/lib/env';

/**
 * Order Confirmation Transactional Email Template
 */
export async function sendOrderConfirmationEmail(params: {
  recipientEmail: string;
  recipientName: string;
  orderNumber: string;
  grandTotal: number;
  trackingToken: string;
}) {
  const trackingUrl = `${env.NEXT_PUBLIC_SITE_URL}/order/${params.trackingToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Inkora Studio</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">INKORA STUDIO.</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Custom Printing Across Pakistan</p>
        </div>

        <h2 style="font-size: 18px; color: #0f172a;">Thank you for your order, ${params.recipientName}!</h2>
        <p>We have received your custom print order <strong>#${params.orderNumber}</strong> totaling <strong>${formatPKR(params.grandTotal)}</strong>.</p>
        
        <p>Our studio team is currently inspecting your artwork specifications. Once approved, we will send digital proof and move directly into print production.</p>

        <div style="margin: 28px 0;">
          <a href="${trackingUrl}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
            View Order & Track Status
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Questions? Reply directly to this email or contact us on WhatsApp at +92 311 1257119.<br>
          © 2026 Inkora Studio. All rights reserved.
        </p>
      </body>
    </html>
  `;

  const text = `
Thank you for your order, ${params.recipientName}!
Order #${params.orderNumber}
Grand Total: ${formatPKR(params.grandTotal)}

Track your order status and proofs here:
${trackingUrl}

Contact us on WhatsApp at +92 311 1257119 for questions.
Inkora Studio Pakistan
  `.trim();

  return await sendTransactionalEmail({
    to: params.recipientEmail,
    subject: `Order Confirmed #${params.orderNumber} - Inkora Studio`,
    html,
    text,
  });
}
