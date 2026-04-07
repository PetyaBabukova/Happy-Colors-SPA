import baseURL from '@/config';
import { readResponseJsonSafely } from '@/utils/errorHandler';

export async function sendContactForm(data) {
  const res = await fetch(`${baseURL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await readResponseJsonSafely(res);

  if (!res.ok) {
    throw new Error(responseData?.message || 'Грешка при изпращането');
  }

  return responseData;
}
