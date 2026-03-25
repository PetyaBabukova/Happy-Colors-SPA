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
    productId && baseClientUrl ? `${baseClientUrl}/products/${productId}` : '';

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
    console.error('Грешка при контактна форма:', {
      code: error?.code || 'UNKNOWN',
      message: error?.message || 'Unknown email error',
    });

    // Не чупим контактната форма на preview/free Render,
    // ако SMTP-то е недостъпно.
    return {
      success: true,
      emailSent: false,
    };
  }

  return {
    success: true,
    emailSent: true,
  };
}