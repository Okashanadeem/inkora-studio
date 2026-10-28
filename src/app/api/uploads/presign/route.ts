import { NextRequest, NextResponse } from 'next/server';
import { presignUploadSchema } from '@/lib/r2/validation';
import { createPresignedUploadUrl } from '@/lib/r2/client';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = presignUploadSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid upload request', details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const { filename, mimeType, isPrivateArtwork } = validated.data;

    // Structured storage layout (Section 15.4):
    // artwork/{yyyy}/{mm}/{randomId}-{filename}
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const randomId = crypto.randomUUID();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = isPrivateArtwork
      ? `artwork/${yyyy}/${mm}/${randomId}-${sanitizedFilename}`
      : `catalog/${yyyy}/${mm}/${randomId}-${sanitizedFilename}`;

    const bucket = isPrivateArtwork ? env.R2_BUCKET_PRIVATE : env.R2_BUCKET_PUBLIC;

    const result = await createPresignedUploadUrl({
      bucket,
      key,
      contentType: mimeType,
      expiresInSeconds: 900,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload presign error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing presigned URL' },
      { status: 500 },
    );
  }
}
