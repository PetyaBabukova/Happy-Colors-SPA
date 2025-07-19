import nodemailer from 'nodemailer';

export async function sendEmail({ subject, text }) {
    console.log('✅ EMAIL:', process.env.CONTACT_EMAIL);
console.log('✅ PASS:', process.env.CONTACT_EMAIL_PASS);
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
