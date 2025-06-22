import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 587,
  secure: false,
  auth: {
    user: process.env.Gmail_EMAIL,
    pass: process.env.Gmail_PASSWORD,
  }, 
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
}
});

interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ from, to, subject, text, html }: EmailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: from || `"DevConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.info("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
