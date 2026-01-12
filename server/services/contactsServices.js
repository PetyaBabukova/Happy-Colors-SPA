import { sendEmail } from '../helpers/sendEmail.js';

export async function handleContactForm({
  name,
  email,
  phone,
  message,
  productId,
  productUrl,
}) {
  // ✅ Ако имаме директен URL (от клиента) – ползваме него.
  // Иначе – опитваме да сглобим от CLIENT_URL (ако е сетнат).
  const baseClientUrl = process.env.CLIENT_URL || '';
  const fallbackUrl =
    productId && baseClientUrl ? `${baseClientUrl}/products/${productId}` : null;

  const finalProductUrl = productUrl || fallbackUrl;

  const subject = finalProductUrl
    ? `Запитване относно продукт: ${finalProductUrl}`
    : 'Ново съобщение от контактната форма на Happy Colors';

  const text = `
Име: ${name}
Имейл: ${email}
Телефон: ${phone || '-'}

${finalProductUrl ? `Продукт: ${finalProductUrl}\n` : ''}
Съобщение:
${message}
  `;

  await sendEmail({ subject, text });
}
