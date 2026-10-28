import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, source = 'product_page' } = body;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: true, isMock: true });
    }

    const supabase = await createClient();

    // Log inquiry click anonymously (Section 12: no private customer message content stored)
    await supabase.from('inquiry_clicks').insert({
      product_id: productId || null,
      source: source || 'product_page',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log WhatsApp inquiry click:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
