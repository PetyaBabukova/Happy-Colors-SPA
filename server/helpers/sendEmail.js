// Updated email helper with retry logic and robust connection handling.
// This version caches the transporter to avoid re-creating it on each call
// and retries transient failures a couple of times before giving up.
// It reads the sender credentials from the environment variables
// CONTACT_EMAIL and CONTACT_EMAIL_PASS. If those variables are missing
// the function will throw an error early.

import nodemailer from 'nodemailer';

// Timeouts are defined in milliseconds. Keeping them relatively short
// ensures the application doesn't hang for too long when the mail server
// is unresponsive.
const DEFAULT_TIMEOUT_MS = 10_000;

// Number of retry attempts for transient network errors. Adjust as needed.
const MAX_RETRIES = 2;

// Cached transporter instance and key used to avoid unnecessary reconnections.
let cachedTransporter = null;
let cachedCredentialsKey = '';

/**
 * Pause execution for the specified duration.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads email credentials from environment variables. Throws if missing.
 */
function getCredentials() {
  const fromEmail = process.env.CONTACT_EMAIL;
  const pass = process.env.CONTACT_EMAIL_PASS;

  if (!fromEmail || !pass) {
    throw new Error('Липсват CONTACT_EMAIL / CONTACT_EMAIL_PASS в .env');
  }

  return { fromEmail, pass };
}

/**
 * Creates a nodemailer transporter using Gmail as the service and provided
 * credentials. Connection and socket timeouts are set to avoid long hangs.
 *
 * @param {string} fromEmail
 * @param {string} pass
 */
function createTransporter(fromEmail, pass) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: fromEmail,
      pass,
    },
    connectionTimeout: DEFAULT_TIMEOUT_MS,
    greetingTimeout: DEFAULT_TIMEOUT_MS,
    socketTimeout: DEFAULT_TIMEOUT_MS,
  });
}

/**
 * Returns a cached transporter instance along with the fromEmail.
 * If credentials change, a new transporter is created.
 */
function getTransporter() {
  const { fromEmail, pass } = getCredentials();
  const credentialsKey = `${fromEmail}:${pass}`;

  if (!cachedTransporter || cachedCredentialsKey !== credentialsKey) {
    cachedTransporter = createTransporter(fromEmail, pass);
    cachedCredentialsKey = credentialsKey;
  }

  return {
    transporter: cachedTransporter,
    fromEmail,
  };
}

/**
 * Determines whether an error is considered transient (e.g. network-related)
 * so that a retry makes sense.
 *
 * @param {Error} error
 */
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

/**
 * Attempts to send the email, retrying on transient failures.
 *
 * @param {object} mailOptions
 */
async function sendWithRetry(mailOptions) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const { transporter } = getTransporter();
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
      if (!isTransientEmailError(error) || attempt === MAX_RETRIES) {
        break;
      }
      // Clear cache to force a new connection on next attempt
      cachedTransporter = null;
      cachedCredentialsKey = '';
      // Exponential backoff between attempts
      await sleep(500 * attempt);
    }
  }
  throw lastError;
}

/**
 * Sends an email using the configured transporter. If the `to` field is
 * omitted, the message will be sent to the admin email (CONTACT_EMAIL).
 *
 * @param {object} param0
 * @param {string} [param0.to] - optional recipient email address
 * @param {string} param0.subject - subject of the email
 * @param {string} param0.text - plain text body of the email
 */
export async function sendEmail({ to, subject, text }) {
  const { fromEmail } = getTransporter();
  const mailOptions = {
    from: fromEmail,
    to: to || fromEmail,
    subject,
    text,
  };
  return sendWithRetry(mailOptions);
}