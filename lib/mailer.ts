import { Resend } from "resend";

type SendOrderEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content?: string | Buffer; path?: string }>;
  orderId?: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey) {
    console.error("CRITICAL: RESEND_API_KEY is missing");
    throw new Error("RESEND_API_KEY is missing");
  }
  if (!fromEmail) {
    console.error("CRITICAL: FROM_EMAIL is missing");
    throw new Error("FROM_EMAIL is missing");
  }
  if (fromEmail.includes("resend.dev")) {
    console.error("CRITICAL: FROM_EMAIL must not use resend.dev domain");
    throw new Error("Invalid FROM_EMAIL domain");
  }

  const resend = new Resend(apiKey);
  const { to, subject, html, text, attachments, orderId } = options;

  console.info("email_from", { from: fromEmail, orderId });

  const basePayload = {
    from: fromEmail,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(attachments?.length ? { attachments } : {}),
  };

  let result;
  try {
    result = await resend.emails.send({
      ...basePayload,
      to,
    });
    console.info("email_customer_sent", { orderId });
  } catch (error: unknown) {
    console.error("email_customer_failed", {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const rawAdmin = process.env.ORDER_TARGET_EMAIL;
  let adminRecipients: string[] = [];

  if (rawAdmin == null) {
    console.warn("ORDER_TARGET_EMAIL is missing; defaulting to gorgerichig@gmail.com");
    adminRecipients = ["gorgerichig@gmail.com"];
  } else {
    const cleaned = rawAdmin
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!cleaned.length) {
      console.warn("ORDER_TARGET_EMAIL is empty; defaulting to gorgerichig@gmail.com");
      adminRecipients = ["gorgerichig@gmail.com"];
    } else {
      adminRecipients = cleaned;
    }
  }

  try {
    await resend.emails.send({
      ...basePayload,
      to: adminRecipients,
    });
    console.info("email_admin_sent", { orderId });
  } catch (error: unknown) {
    console.error("email_admin_failed", {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}
