import nodemailer from 'nodemailer';

const EMAIL = process.env.CONTACT_EMAIL;
const EMAIL_PASSWORD = process.env.CONTACT_EMAIL_PASS;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

export async function sendEmail({ to, subject, text, html }) {
  if (!EMAIL || !EMAIL_PASSWORD) {
    throw new Error('Липсват CONTACT_EMAIL / CONTACT_EMAIL_PASS в environment variables.');
  }

  const mailOptions = {
    from: EMAIL,
    to: to || EMAIL,
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
  };

  return transporter.sendMail(mailOptions);
}