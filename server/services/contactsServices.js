import { sendEmail } from '../helpers/sendEmail.js';

export async function handleContactForm({
  name,
  email,
  phone,
  message,
  productId,
  productUrl,
}) {
  const baseClientUrl = process.env.CLIENT_URL || '';
  const fallbackUrl =
    productId && baseClientUrl ? `${baseClientUrl}/products/${productId}` : null;

  const cleanProductUrl =
    typeof productUrl === 'string' && productUrl.trim() ? productUrl.trim() : '';

  const finalProductUrl = cleanProductUrl || fallbackUrl || '';

  const subject = finalProductUrl
    ? `Запитване относно продукт: ${finalProductUrl}`
    : 'Ново съобщение от контактната форма на Happy Colors';

  const text = `
Име: ${name}
Имейл: ${email}
Телефон: ${phone || '-'}
${finalProductUrl ? `Продукт: ${finalProductUrl}` : ''}
Съобщение:
${message}
`.trim();

  try {
    await sendEmail({
      subject,
      text,
    });
  } catch (error) {
    console.error('Грешка при контактна форма:', error);
    throw new Error('Грешка при изпращане на съобщението.');
  }
}