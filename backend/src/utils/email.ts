import * as nodemailer from 'nodemailer';

const smtpPort = Number.parseInt(process.env.SMTP_PORT || '587', 10);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset',
    text: `Reset your password using this link: ${frontendUrl}/reset-password?token=${resetToken}`,
    html: `
      <p>You requested a password reset.</p>
      <p>
        <a href="${frontendUrl}/reset-password?token=${resetToken}">
          Reset your password
        </a>
      </p>
      <p>This link expires in 1 hour.</p>
    `,
  });
};
