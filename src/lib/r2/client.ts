import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/lib/env';

/**
 * Cloudflare R2 Client (S3-Compatible)
 * Private bucket: customer artwork & proofs (not publicly listed)
 * Public bucket: catalog images & assets
 */
export function getR2Client(): S3Client | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Generate a short-lived presigned URL for direct browser upload to R2
 */
export async function createPresignedUploadUrl(params: {
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const client = getR2Client();
  if (!client) {
    // Development fallback mock URL
    return {
      uploadUrl: `https://mock-r2.inkorastudio.com/upload/${params.key}`,
      key: params.key,
      isMock: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds || 900, // 15 mins default
  });

  return { uploadUrl, key: params.key, isMock: false };
}

/**
 * Generate short-lived signed download URL for staff artwork review
 */
export async function createPresignedDownloadUrl(params: {
  bucket: string;
  key: string;
  expiresInSeconds?: number;
}) {
  const client = getR2Client();
  if (!client) {
    return `https://mock-r2.inkorastudio.com/download/${params.key}`;
  }

  const command = new GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
  });

  return await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds || 3600, // 1 hour
  });
}
