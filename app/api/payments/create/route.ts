import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

const ReqSchema = z.object({
  orderId: z.number().int().positive(),
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

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, publicId: true, totalAmount: true },
  });

  if (!order) {
    return NextResponse.json(
      { ok: false, error: `Order ${orderId} not found` },
      { status: 404 }
    );
  }

  const amount = order.totalAmount;

  const providerPaymentId = "mock_" + crypto.randomBytes(8).toString("hex");
  const payUrl = `/checkout/mock/${providerPaymentId}?orderId=${orderId}${
    method ? `&method=${method}` : ""
  }`;

  await prisma.payment.create({
    data: {
      provider: "mock",
      providerPaymentId,
      orderId: order.id,
      orderPublicId: order.publicId, // <-- ВОТ ЭТОГО НЕ ХВАТАЛО
      amount,
      currency: "RUB",
      status: "pending",
      confirmationUrl: payUrl,
      createRaw: JSON.stringify({ orderId: order.id, amount, method: method ?? null }),
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
