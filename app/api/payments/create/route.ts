import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PayPlan = "full" | "deposit" | "split";

const ReqSchema = z.object({
  orderId: z.string().min(3), // publicId: "order_xxx"
  method: z.enum(["card", "sbp"]).optional(),
  payPlan: z.enum(["full", "deposit", "split"]).optional(),
});

function splitAmount(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  const arr = Array(parts).fill(base) as number[];
  for (let i = 0; i < remainder; i++) arr[i] += 1;
  return arr;
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ReqSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten(), got: body },
      { status: 400 }
    );
  }

  const { orderId: orderPublicId, method, payPlan = "full" } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { publicId: orderPublicId },
  });

  if (!order) {
    return NextResponse.json(
      { ok: false, error: `Order ${orderPublicId} not found` },
      { status: 404 }
    );
  }

  const orderTotal = order.totalAmount; // копейки (полная сумма заказа)

  let amountDueNow = orderTotal;
  let schedule: Array<{ at: string; amount: number }> = [];

  if (payPlan === "deposit") {
    amountDueNow = Math.max(1, Math.round(orderTotal * 0.05));
  }

  if (payPlan === "split") {
    const parts = splitAmount(orderTotal, 4);
    amountDueNow = parts[0];

    const now = new Date();
    schedule = parts.map((amt, idx) => ({
      at: new Date(now.getTime() + idx * 14 * 24 * 60 * 60 * 1000).toISOString(),
      amount: amt,
    }));
  }

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");

  const payUrl =
    `/checkout/mock/${providerPaymentId}` +
    `?orderId=${encodeURIComponent(orderPublicId)}` +
    (method ? `&method=${method}` : "") +
    `&payPlan=${payPlan}`;

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,
      orderId: order.id,             // Int FK
      orderPublicId: order.publicId, // копия
      amount: amountDueNow,          // К ОПЛАТЕ СЕЙЧАС
      currency: "RUB",
      status: "pending",
      confirmationUrl: payUrl,
      createRaw: JSON.stringify({
        orderPublicId,
        method: method ?? null,
        payPlan,
        orderTotal,   // полная сумма
        schedule,     // график для split
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    provider: "mock",
    providerPaymentId,
    status: "pending",
    payUrl,
    amount: amountDueNow,      // к оплате сейчас
    orderId: order.publicId,   // внешний id
    payPlan,
  });
}