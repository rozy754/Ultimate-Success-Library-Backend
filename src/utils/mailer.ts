import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true only for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * =================================================
 * GENERIC EMAIL SENDER (LOW LEVEL / ENGINE)
 * =================================================
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html: html || `<pre>${text}</pre>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📩 MESSAGE ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("🔥 ERROR OBJECT:", error);
    throw error; // bubble up to controller
  }
}

/**
 * =================================================
 * PASSWORD RESET EMAIL (WRAPPER / USE-CASE)
 * =================================================
 */
export async function sendPasswordResetMail(
  to: string,
  resetUrl: string
) {

  const subject = "Reset your password";
  const text = `Reset your password using this link: ${resetUrl}. This link is valid for 15 minutes.`;

  const html = `
    <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:6px">
      <h2>Password Reset</h2>
      <p>Click the button below to reset your password.</p>
      <a href="${resetUrl}"
         style="background:#4F46E5;color:#fff;padding:10px 20px;
         text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0;">
        Reset Password
      </a>
      <p style="font-size:12px;color:#666">
        If you didn’t request this, ignore this email.<br/>
        Link valid for 15 minutes.
      </p>
      <hr />
      <p style="font-size:12px;color:#666">
        If button doesn’t work, copy-paste this link:<br/>
        ${resetUrl}
      </p>
    </div>
  `;

  return sendEmail(to, subject, text, html);
}
