'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle2, AlertTriangle, X, FileText } from 'lucide-react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, calculatePrintDPI } from '@/lib/r2/validation';

export interface FileDropzoneProps {
  onUploadComplete?: (result: { key: string; filename: string; size: number }) => void;
  targetPrintWidthInches?: number;
  className?: string;
}

export function FileDropzone({
  onUploadComplete,
  targetPrintWidthInches = 8.3, // default A4 width
  className,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [dpiWarning, setDpiWarning] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (selectedFile: File) => {
    setErrorMessage(null);
    setDpiWarning(null);
    setUploadSuccess(false);

    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      setErrorMessage('Invalid format. Please upload PNG, JPG, WebP, PDF, or SVG.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File size exceeds the 50MB limit.');
      return;
    }

    setFile(selectedFile);

    // Create client preview and check dimensions if image
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        const { dpi, quality } = calculatePrintDPI(img.width, targetPrintWidthInches);
        if (quality === 'low') {
          setDpiWarning(`Low resolution warning: ~${dpi} DPI. For best results, use 300 DPI.`);
        }
      };
      img.src = url;
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);

    try {
      // 1. Request presigned upload URL from backend
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isPrivateArtwork: true,
        }),
      });

      if (!presignRes.ok) {
        throw new Error('Failed to obtain upload authorization.');
      }

      const { uploadUrl, key, isMock } = await presignRes.json();
      setUploadProgress(50);

      // 2. Upload directly to Cloudflare R2 if real URL, or simulate in mock mode
      if (!isMock) {
        const r2Res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!r2Res.ok) {
          throw new Error('Failed to upload file to storage.');
        }
      }

      setUploadProgress(85);

      // 3. Confirm upload
      await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r2Key: key,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      setUploadProgress(100);
      setUploadSuccess(true);
      if (onUploadComplete) {
        onUploadComplete({ key, filename: file.name, size: file.size });
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Artwork upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const resetSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setDpiWarning(null);
  };

  return (
    <div className={cn('w-full space-y-3', className)}>
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) {
              validateAndProcessFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center',
            dragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border bg-card hover:bg-muted/40 hover:border-primary/60',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".png,.jpg,.jpeg,.webp,.pdf,.svg"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                validateAndProcessFile(e.target.files[0]);
              }
            }}
          />
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            Drop your artwork here, or <span className="text-primary underline">browse</span>
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            PNG, JPG, PDF, SVG, WebP up to 50MB (300 DPI recommended)
          </span>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Artwork preview"
                  className="h-12 w-12 rounded-md object-cover border"
                />
              ) : (
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground border">
                  <FileText className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {!uploading && !uploadSuccess && (
              <Button variant="ghost" size="icon" onClick={resetSelection} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {dpiWarning && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{dpiWarning}</span>
            </div>
          )}

          {uploading && (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {uploadSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Artwork uploaded and verified successfully</span>
            </div>
          ) : (
            !uploading && (
              <Button size="sm" onClick={handleUpload} className="w-full">
                Upload Artwork File
              </Button>
            )
          )}
        </div>
      )}

      {errorMessage && <p className="text-xs text-destructive font-medium">{errorMessage}</p>}
    </div>
  );
}
