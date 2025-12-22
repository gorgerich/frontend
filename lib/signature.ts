import crypto from "crypto";

export function computeHmacBase64(rawBody: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
