// src/app/api/upload-image/route.js
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

// Next.js automatically loads .env.local from the project root
// Debug: Log all GCS-related env variables
console.log('🔍 Environment variables check:');
console.log('GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('NEXT_PUBLIC_GCS_BUCKET_NAME:', process.env.NEXT_PUBLIC_GCS_BUCKET_NAME);
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('GCS')));

const bucketName = process.env.GCS_BUCKET_NAME;

if (!bucketName) {
  console.error('❌ GCS_BUCKET_NAME is not set in environment variables.');
  console.error('Available env vars:', Object.keys(process.env).slice(0, 10));
}

const storage = new Storage();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'Не е получен файл за качване.' },
        { status: 400 }
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { message: 'Липсва конфигурация на кофата (GCS_BUCKET_NAME).' },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || 'upload';
    const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
    const safeExt = ext ? `.${ext}` : '';
    const fileName = `products/${randomUUID()}${safeExt}`;

    const tmpDir = os.tmpdir();
    const tempFilePath = path.join(tmpDir, `hc-upload-${randomUUID()}${safeExt}`);

    await fs.writeFile(tempFilePath, buffer);

    const bucket = storage.bucket(bucketName);
    const destination = fileName;

    await bucket.upload(tempFilePath, {
      destination,
      resumable: false,
      metadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    await fs.unlink(tempFilePath).catch(() => {});

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

    return NextResponse.json({ imageUrl: publicUrl }, { status: 200 });

  } catch (err) {
    console.error('Error in /api/upload-image:', err);
    return NextResponse.json(
      { message: 'Грешка при качване на изображението.' },
      { status: 500 }
    );
  }
}