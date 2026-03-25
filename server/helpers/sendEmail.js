import nodemailer from 'nodemailer';

const SMTP_HOST = 'smtp.gmail.com';
const PRIMARY_PORT = 465;
const SECONDARY_PORT = 587;
const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;

let cachedTransporter = null;
let cachedCredentialsKey = '';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCredentials() {
  const fromEmail = process.env.CONTACT_EMAIL;
  const pass = process.env.CONTACT_EMAIL_PASS;

  if (!fromEmail || !pass) {
    throw new Error('Липсват CONTACT_EMAIL / CONTACT_EMAIL_PASS в environment variables.');
  }

  return { fromEmail, pass };
}

function buildTransportOptions({ fromEmail, pass, port, secure }) {
  return {
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: fromEmail,
      pass,
    },
    family: 4,
    connectionTimeout: DEFAULT_TIMEOUT_MS,
    greetingTimeout: DEFAULT_TIMEOUT_MS,
    socketTimeout: DEFAULT_TIMEOUT_MS,
    tls: {
      servername: SMTP_HOST,
      rejectUnauthorized: true,
    },
  };
}

function createTransporters(fromEmail, pass) {
  return [
    nodemailer.createTransport(
      buildTransportOptions({
        fromEmail,
        pass,
        port: PRIMARY_PORT,
        secure: true,
      })
    ),
    nodemailer.createTransport(
      buildTransportOptions({
        fromEmail,
        pass,
        port: SECONDARY_PORT,
        secure: false,
      })
    ),
  ];
}

function getTransporters() {
  const { fromEmail, pass } = getCredentials();
  const credentialsKey = `${fromEmail}:${pass}`;

  if (!cachedTransporter || cachedCredentialsKey !== credentialsKey) {
    cachedTransporter = createTransporters(fromEmail, pass);
    cachedCredentialsKey = credentialsKey;
  }

  return {
    transporters: cachedTransporter,
    fromEmail,
  };
}

function isTransientEmailError(error) {
  const transientCodes = new Set([
    'ETIMEDOUT',
    'ECONNECTION',
    'ECONNRESET',
    'ESOCKET',
    'EAI_AGAIN',
    'EPROTOCOL',
  ]);

  return transientCodes.has(String(error?.code || '').trim());
}

async function sendWithRetry(mailOptions) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const { transporters } = getTransporters();

    for (const transporter of transporters) {
      try {
        return await transporter.sendMail(mailOptions);
      } catch (error) {
        lastError = error;

        console.error('Email send attempt failed:', {
          attempt,
          to: mailOptions.to,
          subject: mailOptions.subject,
          code: error?.code || 'UNKNOWN',
          message: error?.message || 'Unknown email error',
        });

        if (!isTransientEmailError(error)) {
          throw error;
        }
      }
    }

    cachedTransporter = null;
    cachedCredentialsKey = '';
    await sleep(750 * attempt);
  }

  throw lastError;
}

export async function sendEmail({ to, subject, text }) {
  const { fromEmail } = getTransporters();

  const mailOptions = {
    from: fromEmail,
    to: to || fromEmail,
    subject,
    text,
  };

  return sendWithRetry(mailOptions);
}