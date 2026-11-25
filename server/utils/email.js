import nodemailer from 'nodemailer';

export async function sendVerificationCode(email, name, code) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;
  if (!user || !pass) throw new Error('Set SMTP_USER and SMTP_APP_PASSWORD in server/.env.');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: pass.replace(/\s+/g, '') }
  });
  await transporter.sendMail({
    from: user,
    to: email,
    subject: 'Your email verification code',
    text: `Hello ${name},\n\nYour verification code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.`
  });
}
