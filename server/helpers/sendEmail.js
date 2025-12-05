// server/helpers/sendEmail.js

import nodemailer from 'nodemailer';

export async function sendEmail({ subject, text }) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.CONTACT_EMAIL,
    to: process.env.CONTACT_EMAIL,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}
