import nodemailer from 'nodemailer';

const EMAIL = process.env.CONTACT_EMAIL;
const EMAIL_PASSWORD = process.env.CONTACT_EMAIL_PASS;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

let transporter = null;

function isEmailDisabled() {
  return String(process.env.EMAIL_ENABLED || '').toLowerCase() === 'false';
}

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
  if (isEmailDisabled()) {
    console.warn('Email sending is disabled by EMAIL_ENABLED=false.', {
      to: to || EMAIL,
      subject,
    });

    return {
      skipped: true,
      message: 'Email sending is disabled.',
    };
  }

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