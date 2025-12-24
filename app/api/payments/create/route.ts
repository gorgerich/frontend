import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

const ReqSchema = z.object({
  orderId: z.union([z.string().min(1), z.number().int().positive()]), // поддерживаем оба
  amount: z.number().int().optional(), // фронт может слать, но мы берём из БД
  method: z.enum(["card", "sbp"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ReqSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten(), got: body },
      { status: 400 }
    );
  }

  const { orderId, method } = parsed.data;

  // Находим заказ по publicId (строка) или по id (число)
  const order =
    typeof orderId === "number"
      ? await prisma.order.findUnique({ where: { id: orderId } })
      : await prisma.order.findUnique({ where: { publicId: orderId } });

  if (!order) {
    return NextResponse.json(
      { ok: false, error: `Order ${String(orderId)} not found`, got: body },
      { status: 404 }
    );
  }

  // сумма СТРОГО из БД
  const amount = order.totalAmount;

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");

  const payUrl =
    `/checkout/mock/${providerPaymentId}` +
    `?orderId=${encodeURIComponent(order.publicId)}` +
    (method ? `&method=${method}` : "");

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,
      orderId: order.id,             // Int
      orderPublicId: order.publicId, // обязательное поле
      amount,
      currency: "RUB",
      status: "pending",
      confirmationUrl: payUrl,
      createRaw: JSON.stringify({ orderPublicId: order.publicId, amount, method: method ?? null }),
    },
  });

  // Возвращаем и payUrl, и confirmationUrl — чтобы фронт точно нашёл нужное
  return NextResponse.json({
    ok: true,
    provider: "mock",
    providerPaymentId,
    status: "pending",
    payUrl,
    confirmationUrl: payUrl,
    amount,
    orderId: order.publicId,
  });
}
