import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ReqSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().int().positive(), // копейки
  method: z.enum(["card", "sbp"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ReqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderId, amount, method } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ ok: false, error: `Order ${orderId} not found` }, { status: 404 });
  }

  // синхронизируем сумму заказа (опционально)
  if (order.totalAmount !== amount) {
    await prisma.order.update({ where: { id: orderId }, data: { totalAmount: amount } });
  }

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");
  const payUrl = `/checkout/mock/${providerPaymentId}?orderId=${orderId}${method ? `&method=${method}` : ""}`;

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,
      orderId,
      amount,
      currency: "RUB",
      status: "pending",
      confirmationUrl: payUrl,
      createRaw: JSON.stringify({ orderId, amount, method: method ?? null }),
    },
  });

  return NextResponse.json({
    ok: true,
    provider: "mock",
    providerPaymentId,
    status: "pending",
    payUrl,
  });
}