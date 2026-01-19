import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@tihiydom.com";

type SendOrderEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content?: string | Buffer; path?: string }>;
  orderId?: string;
};

export async function sendOrderEmail(options: SendOrderEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing");
    return;
  }

  const { to, subject, html, text, attachments, orderId } = options;

  const basePayload = {
    from: FROM_EMAIL,
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
  } catch (error: any) {
    console.error("email_customer_failed", { orderId, error: error?.message || String(error) });
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
  } catch (error: any) {
    console.error("email_admin_failed", { orderId, error: error?.message || String(error) });
  }

  return result;
}
