import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import { calcPayNowKopeks } from "@/lib/pricingMath";

export const runtime = "nodejs";

const ReqSchema = z.object({
  orderId: z.string().min(3), // publicId "order_xxx"
  method: z.enum(["card", "sbp"]).optional(),
  payPlan: z.enum(["full", "deposit", "split"]).optional(), // NEW
});

function calcPayNowAmount(totalAmount: number, payPlan: "full" | "deposit" | "split") {
  return calcPayNowKopeks(totalAmount, payPlan);
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

  const totalAmount = order.totalAmount; // копейки
  const payNowAmount = calcPayNowAmount(totalAmount, payPlan);

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");

  // Мы больше не ведём на отдельную страницу, но оставим confirmationUrl на будущее.
  const confirmationUrl =
    `/checkout/mock?paymentId=${encodeURIComponent(providerPaymentId)}` +
    `&orderId=${encodeURIComponent(orderPublicId)}` +
    (method ? `&method=${encodeURIComponent(method)}` : "") +
    `&payPlan=${encodeURIComponent(payPlan)}`;

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,
      orderId: order.id, // Int FK
      orderPublicId: order.publicId,
      amount: payNowAmount, // <-- ВАЖНО: сумма "сейчас"
      currency: "RUB",
      status: "pending",
      confirmationUrl,
      createRaw: JSON.stringify({
        orderPublicId,
        method: method ?? null,
        payPlan,
        totalAmount,
        payNowAmount,
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    provider: "mock",
    providerPaymentId,
    status: "pending",
    confirmationUrl,
    payPlan,
    totalAmount,
    payNowAmount,
    orderId: order.publicId,
  });
}
