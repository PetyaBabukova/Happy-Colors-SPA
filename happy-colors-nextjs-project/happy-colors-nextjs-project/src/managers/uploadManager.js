// src/managers/uploadManager.js

// Тази функция се вика от ProductForm.jsx при избор на файл.
// Тя качва файла към Next API /api/upload-image и връща публичния URL.

export async function uploadImageToBucket(file) {
  if (!file) {
    throw new Error('Не е избран файл.');
  }

  const formData = new FormData();
  formData.append('file', file);

  let res;

  try {
    res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    console.error('Network error when calling /api/upload-image:', err);
    throw new Error('Възникна грешка при качването на изображението.');
  }

  if (!res.ok) {
    let msg = 'Възникна грешка при качването на изображението.';

    try {
      const data = await res.json();
      if (data?.message) {
        msg = data.message;
      }
    } catch {
      // ignore parse error
    }

    throw new Error(msg);
  }

  let data;

  try {
    data = await res.json();
  } catch (err) {
    console.error('Invalid JSON from /api/upload-image:', err);
    throw new Error('Възникна грешка при качването на изображението.');
  }

  if (!data.imageUrl) {
    console.error('No imageUrl in /api/upload-image response:', data);
    throw new Error('Възникна грешка при качването на изображението.');
  }

  return data.imageUrl;
}
