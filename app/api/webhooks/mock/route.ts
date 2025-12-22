import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Schema = z.object({
  event: z.string(),
  provider_payment_id: z.string(),
  order_id: z.number().int().positive(),
  status: z.enum(["succeeded", "canceled", "failed"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { provider_payment_id, order_id, status } = parsed.data;

  const p = await prisma.payment.findUnique({ where: { providerPaymentId: provider_payment_id } });
  if (!p) return NextResponse.json({ ok: false, error: "payment not found" }, { status: 404 });

  await prisma.payment.update({
    where: { providerPaymentId: provider_payment_id },
    data: { status, webhookRaw: JSON.stringify(body) },
  });

  if (status === "succeeded") {
    await prisma.order.update({
      where: { id: order_id },
      data: { status: "CONFIRMED" },
    });
  }

  if (status === "canceled") {
    await prisma.order.update({
      where: { id: order_id },
      data: { status: "CANCELLED" },
    });
  }

  // failed: заказ оставляем PENDING или как вы решите; сейчас не меняем

  return NextResponse.json({ ok: true });
}
