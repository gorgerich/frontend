// app/lib/mailer.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("RESEND_API_KEY is missing");
  throw new Error("RESEND_API_KEY is missing");
}

const resend = new Resend(resendApiKey);

export type SendOrderEmailOptions = {
  html: string;
  subject: string;
  customerEmail: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  const from = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const internal = process.env.ORDER_TARGET_EMAIL;

  const to = [options.customerEmail, internal].filter(Boolean) as string[];

  if (!from || to.length === 0) {
    throw new Error(
      `MAILER CONFIG ERROR: invalid from/to. from=${from}, to=${JSON.stringify(
        to,
      )}`,
    );
  }

  const result = await resend.emails.send({
    from,
    to,
    subject: options.subject,
    html: options.html,
  });

  console.log("MAIL SENT VIA RESEND", result);
}
