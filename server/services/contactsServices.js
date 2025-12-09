// server/services/contactsServices.js

import { sendEmail } from '../helpers/sendEmail.js';

export async function handleContactForm({ name, email, phone, message }) {
  const subject = 'Ново съобщение от контактната форма на Happy Colors';
  const text = `
Име: ${name}
Имейл: ${email}
Телефон: ${phone || '-'}
Съобщение: ${message}
  `;

  await sendEmail({ subject, text });
}
