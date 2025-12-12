// app/lib/mailer.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// от кого отправляем письма
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@tihiydom.com";

type SendOrderEmailOptions = {
  to: string | string[];  // можно строку или массив строк
  subject: string;
  html: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing");
    return;
  }

  const { to, subject, html } = options;

  // НИЧЕГО не джойним, передаём в Resend как есть
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,          // тут может быть string или string[]
    subject,
    html,
  });

  return result;
}