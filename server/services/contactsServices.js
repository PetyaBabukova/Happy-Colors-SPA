import { sendEmail } from '../helpers/sendEmail.js';

export async function handleContactForm({
  name,
  email,
  phone,
  message,
  productId,
  productTitle,
  productUrl,
}) {
  const baseClientUrl = process.env.CLIENT_URL || '';
  const fallbackUrl =
    productId && baseClientUrl ? `${baseClientUrl}/products/${productId}` : null;

  const finalProductUrl = productUrl || fallbackUrl;
  const hasProduct = productTitle || productId || finalProductUrl;

  const subject = productTitle
    ? `Запитване за: ${productTitle}`
    : finalProductUrl
      ? `Запитване относно продукт: ${finalProductUrl}`
      : 'Ново съобщение от контактната форма на Happy Colors';

  const productBlock = hasProduct
    ? [
        productTitle && `Продукт: ${productTitle}`,
        productId && `Product ID: ${productId}`,
        finalProductUrl && `Линк: ${finalProductUrl}`,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const text = [
    `Име: ${name}`,
    `Имейл: ${email}`,
    `Телефон: ${phone || '-'}`,
    '',
    productBlock,
    productBlock ? '' : null,
    'Съобщение:',
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  await sendEmail({ subject, text });
}