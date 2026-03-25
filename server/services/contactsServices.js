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
    typeof productUrl === 'string' && productUrl.trim() ? productUrl.trim() : null;

  const finalProductUrl = cleanProductUrl || fallbackUrl || null;

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
`.trim();

  try {
    await sendEmail({ subject, text });
  } catch (error) {
    console.error('Грешка при контактна форма:', error);
    throw new Error(
      'Съобщението не можа да бъде изпратено в момента. Моля, опитайте отново по-късно.'
    );
  }
}