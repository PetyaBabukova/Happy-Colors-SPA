import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

export const runtime = 'nodejs';

const bucketName = process.env.GCS_BUCKET_NAME;

function resolveGoogleCredentialsPath() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    '/etc/secrets/gcp-service-account.json',
    path.join(process.cwd(), 'gcp-service-account.json'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

const keyFilename = resolveGoogleCredentialsPath();

const storage = keyFilename
  ? new Storage({ keyFilename })
  : new Storage();

export async function POST(request) {
  let tempFilePath = null;

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

    if (!keyFilename) {
      return NextResponse.json(
        { message: 'Липсват Google credentials за качване на изображения.' },
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
    tempFilePath = path.join(tmpDir, `hc-upload-${randomUUID()}${safeExt}`);

    await fsPromises.writeFile(tempFilePath, buffer);

    const bucket = storage.bucket(bucketName);

    await bucket.upload(tempFilePath, {
      destination: fileName,
      resumable: false,
      metadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return NextResponse.json({ imageUrl: publicUrl }, { status: 200 });
  } catch (err) {
    console.error('Error in /api/upload-image:', err);

    return NextResponse.json(
      { message: 'Грешка при качване на изображението.' },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      await fsPromises.unlink(tempFilePath).catch(() => {});
    }
  }
}