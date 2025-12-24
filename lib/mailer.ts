import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@tihiydom.com";

type SendOrderEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing");
    return;
  }

  const { to, subject, html } = options;

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  return result;
}
