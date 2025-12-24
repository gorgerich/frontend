// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

const ReqSchema = z.object({
  // ВАЖНО: это publicId вида "order_xxx", а не числовой Order.id
  orderId: z.string().min(1),
  method: z.enum(["card", "sbp"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = ReqSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten(), got: body },
      { status: 400 }
    );
  }

  const { orderId: orderPublicId, method } = parsed.data;

  // ищем заказ по publicId
  const order = await prisma.order.findUnique({ where: { publicId: orderPublicId } });
  if (!order) {
    return NextResponse.json(
      { ok: false, error: `Order ${orderPublicId} not found` },
      { status: 404 }
    );
  }

  // сумма строго из БД (копейки)
  const amount = order.totalAmount;

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");

  // ссылка на эмулятор: достаточно paymentId, orderId можно не таскать query-параметром
  const payUrl = `/checkout/mock/${providerPaymentId}?method=${method ?? "card"}`;

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,

      // внутренняя связь
      orderId: order.id,

      // внешняя связь/отображение
      orderPublicId: order.publicId,

      amount,
      currency: "RUB",
      status: "pending",
      confirmationUrl: payUrl,
      createRaw: JSON.stringify({ orderPublicId, amount, method: method ?? null }),
    },
  });

  return NextResponse.json({
    ok: true,
    provider: "mock",
    providerPaymentId,
    status: "pending",
    payUrl,
    amount,
  });
}
