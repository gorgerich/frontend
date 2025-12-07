// app/lib/mailer.ts
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? "465");
const smtpSecure = String(process.env.SMTP_SECURE ?? "true") === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error("MAILER CONFIG ERROR: missing SMTP env", {
    smtpHost,
    smtpUser,
    hasPass: Boolean(smtpPass),
  });
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export type SendOrderEmailOptions = {
  html: string;
  subject: string;
  customerEmail: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  const from = process.env.FROM_EMAIL || smtpUser;
  const internal = process.env.ORDER_TARGET_EMAIL || smtpUser;

  const to = [options.customerEmail, internal]
    .filter(Boolean)
    .join(", ");

  if (!from || !to) {
    throw new Error(
      `MAILER CONFIG ERROR: invalid from/to. from=${from}, to=${to}`
    );
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject: options.subject,
    html: options.html,
  });

  console.log("MAIL SENT", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    envelope: info.envelope,
  });
}
