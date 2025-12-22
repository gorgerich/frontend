import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ReqSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().int().positive(), // копейки
  method: z.enum(["card", "sbp"]).optional(),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ReqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderId, amount } = parsed.data;

  // Важно: у вас Order требует userId, serviceType, meta.
  // Поэтому мы НЕ создаём Order здесь (upsert убрать нельзя без заполнения обязательных полей).
  // Мы проверяем, что Order существует.
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json(
      {
        success: false,
        error: `Order ${orderId} not found. Create order first (with userId, serviceType, meta, totalAmount).`,
      },
      { status: 404 }
    );
  }

  // (опционально) синхронизируем сумму заказа
  if (order.totalAmount !== amount) {
    await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: amount },
    });
  }

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");
  const confirmationUrl = `/mock-checkout/${providerPaymentId}?orderId=${orderId}`;

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,
      orderId,
      amount,
      currency: "RUB",
      status: "pending",
      confirmationUrl,
      createRaw: JSON.stringify({ orderId, amount }),
    },
  });

  return NextResponse.json({
    provider: "mock",
    providerPaymentId,
    status: "pending",
    payUrl: confirmationUrl,
  });
}
