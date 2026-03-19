import nodemailer from 'nodemailer';

function createTransporter(fromEmail, pass) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: fromEmail,
      pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function sendEmail({ to, subject, text }) {
  const fromEmail = process.env.CONTACT_EMAIL;
  const pass = process.env.CONTACT_EMAIL_PASS;

  if (!fromEmail || !pass) {
    throw new Error('Липсват CONTACT_EMAIL / CONTACT_EMAIL_PASS в .env');
  }

  const transporter = createTransporter(fromEmail, pass);

  await transporter.verify();

  const mailOptions = {
    from: fromEmail,
    to: to || fromEmail,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}