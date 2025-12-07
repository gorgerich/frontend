// app/lib/mailer.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set – emails will not be sent");
}

const resend = new Resend(resendApiKey);

type SendOrderEmailOptions = {
  to: string;     // куда отправляем
  subject: string; // тема письма
  html: string;    // уже готовый HTML письма
};

export async function sendOrderEmail({
  to,
  subject,
  html,
}: SendOrderEmailOptions) {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const from = process.env.FROM_EMAIL || "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    // Пробрасываем ошибку наверх, её ловит /api/orders
    throw error;
  }

  return data;
}
