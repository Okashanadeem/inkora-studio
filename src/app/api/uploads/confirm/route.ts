import { NextRequest, NextResponse } from 'next/server';
import { confirmUploadSchema } from '@/lib/r2/validation';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = confirmUploadSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid upload confirmation', details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const { orderItemId, r2Key, mimeType, fileSize, width, height, dpi } = validated.data;

    // If an order item exists, record into artwork_files table
    if (orderItemId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient();
      await adminClient.from('artwork_files').insert({
        order_item_id: orderItemId,
        r2_key: r2Key,
        mime_type: mimeType,
        file_size: fileSize,
        width: width || null,
        height: height || null,
        dpi: dpi || null,
        status: 'uploaded',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Artwork upload recorded successfully',
      key: r2Key,
    });
  } catch (error) {
    console.error('Upload confirm error:', error);
    return NextResponse.json({ error: 'Failed to record artwork upload' }, { status: 500 });
  }
}
