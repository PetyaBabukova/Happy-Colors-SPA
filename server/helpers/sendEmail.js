// server/helpers/sendEmail.js

import nodemailer from 'nodemailer';

/**
 * sendEmail({ to?, subject, text })
 * - Ако "to" липсва -> праща към CONTACT_EMAIL (admin)
 * - Ако "to" е подаден -> праща към него (например клиент)
 */
export async function sendEmail({ to, subject, text }) {
  const fromEmail = process.env.CONTACT_EMAIL;
  const pass = process.env.CONTACT_EMAIL_PASS;

  if (!fromEmail || !pass) {
    throw new Error('Липсват CONTACT_EMAIL / CONTACT_EMAIL_PASS в .env');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: fromEmail,
      pass,
    },
  });

  const mailOptions = {
    from: fromEmail,
    to: to || fromEmail,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}
