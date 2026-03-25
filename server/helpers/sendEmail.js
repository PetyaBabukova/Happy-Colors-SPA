import nodemailer from 'nodemailer';

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL = process.env.CONTACT_EMAIL;
const EMAIL_PASSWORD = process.env.CONTACT_EMAIL_PASS;

let transporter = null;

function getTransporter() {
  if (!EMAIL || !EMAIL_PASSWORD) {
    throw new Error('Липсват CONTACT_EMAIL / CONTACT_EMAIL_PASS в environment variables.');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const activeTransporter = getTransporter();

  const mailOptions = {
    from: EMAIL,
    to: to || EMAIL,
    subject,
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
  };

  return activeTransporter.sendMail(mailOptions);
}