import { NextResponse } from "next/server";
import { computeHmacBase64, safeEqual } from "@/lib/signature";
import { z } from "zod";

const WebhookSchema = z.object({
  event: z.string(),
  payment_id: z.string(),
  order_id: z.string(),
  status: z.string(),
  amount: z.number().int(),
  currency: z.literal("RUB"),
  signature: z.string(),
});

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "no secret" }, { status: 500 });

  const expected = computeHmacBase64(raw, secret);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const parsed = WebhookSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad schema" }, { status: 400 });

  const { signature, ...payload } = parsed.data;

  if (!safeEqual(signature, expected)) {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 401 });
  }

  // TODO: обновить Payment/Order в БД по payload.payment_id или payload.order_id
  // if (payload.status === "succeeded") markOrderPaid(payload.order_id)

  return NextResponse.json({ ok: true });
}
