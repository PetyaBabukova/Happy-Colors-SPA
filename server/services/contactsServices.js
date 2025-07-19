import { sendEmail } from '../helpers/sendEmail.js';

export async function handleContactForm({ name, email, phone, message }) {
  const subject = 'Ново съобщение от контактната форма';
  const text = `
Име: ${name}
Имейл: ${email}
Телефон: ${phone || '-'}
Съобщение:
${message}
  `;

  await sendEmail({ subject, text });
}
