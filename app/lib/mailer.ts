import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const { to, subject, html } = options;

  const from = process.env.FROM_EMAIL;
  
  if (!from) {
    throw new Error("FROM_EMAIL is not defined");
  }

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  return result;
}
