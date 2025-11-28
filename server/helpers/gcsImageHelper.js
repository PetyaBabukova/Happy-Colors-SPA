// server/helpers/gcsImageHelper.js
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

// helper, за да четем винаги актуалната стойност
function getBucketName() {
  return process.env.GCS_BUCKET_NAME;
}

/**
 * Вади object name от GCS URL:
 * https://storage.googleapis.com/happycolors-store/products/xxx.jpg
 *  -> products/xxx.jpg
 */
function extractObjectNameFromUrl(imageUrl) {
  if (!imageUrl) return null;

  const bucketName = getBucketName();
  if (!bucketName) return null;

  try {
    const url = new URL(imageUrl);

    // /happycolors-store/products/....
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const bucketFromUrl = parts[0];
    if (bucketFromUrl !== bucketName) {
      console.warn(
        `GCS helper: bucket in URL (${bucketFromUrl}) != env bucket (${bucketName}).`
      );
      return null;
    }

    // products/...
    return parts.slice(1).join('/');
  } catch (err) {
    console.error('GCS helper: invalid imageUrl:', imageUrl, err);
    return null;
  }
}

/**
 * Трие файл от кофата, ако imageUrl е валиден GCS линк.
 * Не хвърля грешка навън – само логва.
 */
export async function deleteImageFromGCS(imageUrl) {
  const bucketName = getBucketName();

  if (!bucketName) {
    console.warn('GCS_BUCKET_NAME is not set, skip deleting image from GCS.');
    return;
  }

  const objectName = extractObjectNameFromUrl(imageUrl);
  if (!objectName) {
    console.warn(
      'GCS delete skipped – cannot extract object name from URL:',
      imageUrl
    );
    return;
  }

  try {
    const file = storage.bucket(bucketName).file(objectName);
    await file.delete({ ignoreNotFound: true });
    console.log(`GCS: deleted image ${objectName}`);
  } catch (err) {
    if (err.code === 404) {
      console.log(`GCS: image not found, ignore: ${objectName}`);
      return;
    }
    console.error('Error deleting image from GCS:', err);
  }
}
