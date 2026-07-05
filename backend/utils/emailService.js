const { sendEmail } = require('../config/email');

// ---------------------------------------------------------------------------
// Shared HTML wrapper for consistent, cross-client email rendering
// ---------------------------------------------------------------------------
const wrapTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;color:#374151;font-size:15px;line-height:1.7;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
              &copy; ${new Date().getFullYear()} Portfolio CMS &mdash; This is an automated email, please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Reusable CTA button
const ctaButton = (href, label) => `
<div style="text-align:center;margin:28px 0;">
  <a href="${href}"
     style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
            color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
    ${label}
  </a>
</div>`;

// ---------------------------------------------------------------------------
// Email Functions
// ---------------------------------------------------------------------------

/**
 * Send an email-verification link to the user.
 *
 * @param {object} user  – User document (needs .email, .name).
 * @param {string} token – Verification token.
 */
const sendVerificationEmail = async (user, token) => {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';
  const verifyUrl = `${adminUrl}/admin/verify-email/${token}`;

  const html = wrapTemplate(
    'Verify Your Email',
    `<p>Hi <strong>${user.name || 'there'}</strong>,</p>
     <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
     ${ctaButton(verifyUrl, 'Verify Email Address')}
     <p style="font-size:13px;color:#6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
     <p style="font-size:13px;word-break:break-all;color:#6366f1;">${verifyUrl}</p>
     <p style="font-size:13px;color:#6b7280;">This link will expire in <strong>24 hours</strong>.</p>`
  );

  await sendEmail(user.email, 'Verify Your Email Address', html);
};

/**
 * Send a password-reset link to the user.
 *
 * @param {object} user  – User document (needs .email, .name).
 * @param {string} token – Password-reset token.
 */
const sendPasswordResetEmail = async (user, token) => {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';
  const resetUrl = `${adminUrl}/admin/reset-password/${token}`;

  const html = wrapTemplate(
    'Reset Your Password',
    `<p>Hi <strong>${user.name || 'there'}</strong>,</p>
     <p>We received a request to reset your password. Click the button below to choose a new password:</p>
     ${ctaButton(resetUrl, 'Reset Password')}
     <p style="font-size:13px;color:#6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
     <p style="font-size:13px;word-break:break-all;color:#6366f1;">${resetUrl}</p>
     <p style="font-size:13px;color:#6b7280;">This link will expire in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.</p>`
  );

  await sendEmail(user.email, 'Password Reset Request', html);
};

/**
 * Send a 6-digit OTP code to the user.
 *
 * @param {object} user – User document (needs .email, .name).
 * @param {string} otp  – 6-digit OTP string.
 */
const sendOTPEmail = async (user, otp) => {
  const html = wrapTemplate(
    'Your Verification Code',
    `<p>Hi <strong>${user.name || 'there'}</strong>,</p>
     <p>Use the following one-time code to complete your verification:</p>
     <div style="text-align:center;margin:28px 0;">
       <span style="display:inline-block;padding:16px 40px;background-color:#f3f4f6;border-radius:8px;
                    font-size:32px;font-weight:700;letter-spacing:8px;color:#1f2937;">${otp}</span>
     </div>
     <p style="font-size:13px;color:#6b7280;">This code will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>`
  );

  await sendEmail(user.email, `Your Verification Code: ${otp}`, html);
};

/**
 * Notify the user of a new login from an unrecognized device / location.
 *
 * @param {object} user       – User document (needs .email, .name).
 * @param {object} deviceInfo – { browser, os, device, ip, timestamp }.
 */
const sendLoginAlertEmail = async (user, deviceInfo) => {
  const {
    browser = 'Unknown',
    os = 'Unknown',
    device = 'Unknown',
    ip = 'Unknown',
    timestamp = new Date().toLocaleString(),
  } = deviceInfo || {};

  const html = wrapTemplate(
    'New Login Detected',
    `<p>Hi <strong>${user.name || 'there'}</strong>,</p>
     <p>We detected a new sign-in to your account. If this was you, no action is needed.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="background-color:#f9fafb;border-radius:6px;margin:20px 0;padding:16px;">
       <tr><td style="padding:8px 16px;color:#6b7280;font-size:13px;">Browser</td>
           <td style="padding:8px 16px;color:#1f2937;font-size:13px;font-weight:600;">${browser}</td></tr>
       <tr><td style="padding:8px 16px;color:#6b7280;font-size:13px;">Operating System</td>
           <td style="padding:8px 16px;color:#1f2937;font-size:13px;font-weight:600;">${os}</td></tr>
       <tr><td style="padding:8px 16px;color:#6b7280;font-size:13px;">Device</td>
           <td style="padding:8px 16px;color:#1f2937;font-size:13px;font-weight:600;">${device}</td></tr>
       <tr><td style="padding:8px 16px;color:#6b7280;font-size:13px;">IP Address</td>
           <td style="padding:8px 16px;color:#1f2937;font-size:13px;font-weight:600;">${ip}</td></tr>
       <tr><td style="padding:8px 16px;color:#6b7280;font-size:13px;">Time</td>
           <td style="padding:8px 16px;color:#1f2937;font-size:13px;font-weight:600;">${timestamp}</td></tr>
     </table>
     <p style="font-size:13px;color:#ef4444;"><strong>If this wasn't you</strong>, change your password immediately and contact support.</p>`
  );

  await sendEmail(user.email, '⚠️ New Login to Your Account', html);
};


/**
 * Notify the admin when a visitor submits a contact-form message.
 */
const sendContactAdminNotification = async (adminEmail, messageData, ipAddress = 'N/A') => {
  const { name, email, phone = 'N/A', subject = 'No Subject', message, createdAt = new Date() } = messageData;
  const submissionTime = new Date(createdAt).toLocaleString();
  const html = wrapTemplate(
    'New Contact Message Received',
    `<p>Hello Admin,</p>
     <p>You have received a new contact message from <strong>Tauhid Shekhar Portfolio</strong>.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb;border-collapse:separate;">
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;width:120px;border-bottom:1px solid #e5e7eb;"><strong>Full Name</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${name}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Email Address</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#6366f1;text-decoration:none;">${email}</a></td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Phone Number</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${phone}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Subject</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${subject}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Submission Time</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${submissionTime}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>IP Address</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${ipAddress}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Message</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;line-height:1.6;white-space:pre-wrap;">${message}</td></tr>
     </table>
     <p style="font-size:13px;color:#6b7280;">You can reply directly to the client at <a href="mailto:${email}" style="color:#6366f1;">${email}</a>.</p>`
  );
  await sendEmail(adminEmail, `📬 New Contact Inquiry: ${subject}`, html);
};

/**
 * Send receipt confirmation back to the contacting user.
 */
const sendContactUserConfirmation = async (userEmail, messageData) => {
  const { name, subject = 'No Subject', message } = messageData;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const html = wrapTemplate(
    'Thank You! We Received Your Request',
    `<p>Hi <strong>${name}</strong>,</p>
     <p>Thank you for reaching out! I have received your contact inquiry and will get back to you as soon as possible.</p>
     <p>Here are the details you submitted:</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb;border-collapse:separate;padding:16px;">
       <tr><td style="color:#6b7280;font-size:13px;width:100px;padding:4px 0;"><strong>Subject</strong></td>
           <td style="color:#1f2937;font-size:13px;font-weight:600;padding:4px 0;">${subject}</td></tr>
       <tr><td style="color:#6b7280;font-size:13px;vertical-align:top;padding:4px 0;"><strong>Message</strong></td>
           <td style="color:#1f2937;font-size:13px;line-height:1.5;padding:4px 0;white-space:pre-wrap;">${message}</td></tr>
     </table>
     <p><strong>Expected Response Time:</strong> 24–48 hours</p>
     <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
     <p style="font-size:13px;color:#6b7280;margin:0;">Best Regards,</p>
     <p style="font-size:14px;font-weight:700;color:#1f2937;margin:4px 0 0 0;">Tauhid Shekhar</p>
     <p style="font-size:13px;color:#6b7280;margin:2px 0 0 0;"><a href="${clientUrl}" style="color:#6366f1;text-decoration:none;">${clientUrl}</a> | shekhartauhid@gmail.com</p>`
  );
  await sendEmail(userEmail, 'Thank You! We Received Your Request', html);
};

/**
 * Notify the admin of a new project service request order sheet.
 */
const sendOrderAdminNotification = async (adminEmail, orderData, ipAddress = 'N/A') => {
  const { name, email, phone = 'N/A', companyName = 'N/A', selectedService, budget, projectType = 'N/A', deadline, description, attachment, createdAt = new Date() } = orderData;
  const submissionTime = new Date(createdAt).toLocaleString();
  const deadlineStr = deadline ? new Date(deadline).toLocaleDateString() : 'No Deadline';
  
  let attachmentRow = '';
  if (attachment && attachment.url) {
    const sizeKB = attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : 'Unknown';
    attachmentRow = `<tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Attachment</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;"><a href="${attachment.url}" target="_blank" style="color:#6366f1;text-decoration:none;font-weight:600;">Download ${attachment.fileName || 'Attachment'} (${sizeKB})</a></td></tr>`;
  }

  const html = wrapTemplate(
    'New Service Order Request Received',
    `<p>Hello Admin,</p>
     <p>A new client has placed a service order inquiry on <strong>Tauhid Shekhar Portfolio</strong>.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb;border-collapse:separate;">
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;width:145px;border-bottom:1px solid #e5e7eb;"><strong>Client Name</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${name}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Email Address</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#6366f1;text-decoration:none;">${email}</a></td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Phone Number</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${phone}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Company Name</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${companyName}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Service Selection</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;color:#6366f1;">${selectedService}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Budget / Price</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;color:#10b981;">${budget}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Project Type</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${projectType}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Target Deadline</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${deadlineStr}</td></tr>
       ${attachmentRow}
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>Submission Time</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${submissionTime}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;"><strong>IP Address</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;border-bottom:1px solid #e5e7eb;">${ipAddress}</td></tr>
       <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Project Scope</strong></td>
           <td style="padding:12px 16px;color:#1f2937;font-size:13px;line-height:1.6;white-space:pre-wrap;">${description}</td></tr>
     </table>
     <p style="font-size:13px;color:#6b7280;">You can email the client directly at <a href="mailto:${email}" style="color:#6366f1;">${email}</a>.</p>`
  );
  await sendEmail(adminEmail, `💼 New Service Order: ${selectedService} (${budget})`, html);
};

/**
 * Send confirmation email back to the client placing a service order.
 */
const sendOrderUserConfirmation = async (userEmail, orderData) => {
  const { name, selectedService, budget, deadline, description, attachment } = orderData;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const deadlineStr = deadline ? new Date(deadline).toLocaleDateString() : 'No Target Date';
  
  let fileText = 'None provided';
  if (attachment && attachment.url) {
    fileText = `Yes, uploaded: ${attachment.fileName}`;
  }

  const html = wrapTemplate(
    'Thank You! We Received Your Request',
    `<p>Hi <strong>${name}</strong>,</p>
     <p>Thank you for placing an order request! I have received your project details and will review them shortly.</p>
     <p>Here are the parameters of your service order submission:</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb;border-collapse:separate;padding:16px;">
       <tr><td style="color:#6b7280;font-size:13px;width:130px;padding:4px 0;"><strong>Selected Service</strong></td>
           <td style="color:#1f2937;font-size:13px;font-weight:600;padding:4px 0;">${selectedService}</td></tr>
       <tr><td style="color:#6b7280;font-size:13px;padding:4px 0;"><strong>Budget Proposal</strong></td>
           <td style="color:#1f2937;font-size:13px;font-weight:600;padding:4px 0;color:#10b981;">${budget}</td></tr>
       <tr><td style="color:#6b7280;font-size:13px;padding:4px 0;"><strong>Target Deadline</strong></td>
           <td style="color:#1f2937;font-size:13px;padding:4px 0;">${deadlineStr}</td></tr>
       <tr><td style="color:#6b7280;font-size:13px;padding:4px 0;"><strong>Attachment Uploaded</strong></td>
           <td style="color:#1f2937;font-size:13px;padding:4px 0;">${fileText}</td></tr>
       <tr><td style="color:#6b7280;font-size:13px;vertical-align:top;padding:4px 0;"><strong>Project Description</strong></td>
           <td style="color:#1f2937;font-size:13px;line-height:1.5;padding:4px 0;white-space:pre-wrap;">${description}</td></tr>
     </table>
     <p><strong>Expected Response Time:</strong> 24–48 hours</p>
     <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
     <p style="font-size:13px;color:#6b7280;margin:0;">Best Regards,</p>
     <p style="font-size:14px;font-weight:700;color:#1f2937;margin:4px 0 0 0;">Tauhid Shekhar</p>
     <p style="font-size:13px;color:#6b7280;margin:2px 0 0 0;"><a href="${clientUrl}" style="color:#6366f1;text-decoration:none;">${clientUrl}</a> | shekhartauhid@gmail.com</p>`
  );
  await sendEmail(userEmail, 'Thank You! We Received Your Request', html);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendLoginAlertEmail,
  sendContactAdminNotification,
  sendContactUserConfirmation,
  sendOrderAdminNotification,
  sendOrderUserConfirmation,
};
