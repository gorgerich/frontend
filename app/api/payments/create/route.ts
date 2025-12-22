// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

export const runtime = "nodejs";

const ReqSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().positive(), // копейки
  method: z.enum(["card", "sbp"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ReqSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten(), got: body },
      { status: 400 }
    );
  }

  const { orderId, amount, method } = parsed.data;

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");

  // ВАЖНО: путь должен совпадать с файлом страницы
  // app/checkout/mock/[paymentId]/page.tsx
  const payUrl =
    `/checkout/mock/${providerPaymentId}` +
    `?orderId=${encodeURIComponent(orderId)}` +
    `&amount=${amount}` +
    (method ? `&method=${method}` : "");

  return NextResponse.json({
    ok: true,
    provider: "mock",
    providerPaymentId,
    status: "pending",
    payUrl,
  });
}
