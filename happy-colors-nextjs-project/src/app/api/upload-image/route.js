// src/app/api/upload-image/route.js
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

const bucketName = process.env.GCS_BUCKET_NAME;

if (!bucketName) {
  console.error('GCS_BUCKET_NAME is not set in environment variables.');
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

    // качваме файла в GCS от temp файла
    await bucket.upload(tempFilePath, {
      destination,
      resumable: false,
      metadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    // НЕ пипаме ACL (uniform bucket-level access е включен)
    // ако искаш файловете да са публични, това се настройва на ниво bucket през GCP конзолата

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
