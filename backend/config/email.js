const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Nodemailer Transporter — Gmail SMTP
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Do not fail on invalid certs (useful in dev; in production use valid certs)
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

/**
 * Send an email via the configured SMTP transporter.
 *
 * @param {string} to       – Recipient email address.
 * @param {string} subject  – Email subject line.
 * @param {string} html     – Email body as an HTML string.
 * @returns {Promise<object>} – Nodemailer send result.
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Portfolio CMS" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = { transporter, sendEmail };
