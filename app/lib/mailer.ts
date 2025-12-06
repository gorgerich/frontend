// app/lib/mailer.ts
import nodemailer from "nodemailer";

type SendOrderEmailOptions = {
  html: string;
  subject: string;
  customerEmail: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = String(process.env.SMTP_SECURE ?? "true") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error("SMTP env vars are missing");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const from =
    process.env.FROM_EMAIL && process.env.FROM_EMAIL.trim().length > 0
      ? process.env.FROM_EMAIL
      : user;

  const internalEmail = process.env.ORDER_TARGET_EMAIL;

  const to = [options.customerEmail, internalEmail]
    .filter(Boolean)
    .join(",");

  await transporter.sendMail({
    from,
    to,
    subject: options.subject,
    html: options.html,
  });
}
