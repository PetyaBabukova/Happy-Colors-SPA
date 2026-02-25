import baseURL from '@/config';

export async function sendContactForm(data) {
  const res = await fetch(`${baseURL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Грешка при изпращането');
  }

  return res.json();
}
