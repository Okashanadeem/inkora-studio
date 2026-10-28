import { Resend } from 'resend';
import { env } from '@/lib/env';

export function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(env.RESEND_API_KEY);
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send transactional email via Resend
 * Fails gracefully in local development when API key is not present.
 */
export async function sendTransactionalEmail(params: SendEmailParams) {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[Email MOCK] To: ${params.to} | Subject: ${params.subject}`);
    return { success: true, isMock: true };
  }

  try {
    const data = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    return { success: true, data, isMock: false };
  } catch (error) {
    console.error('Failed to send transactional email via Resend:', error);
    return { success: false, error };
  }
}
