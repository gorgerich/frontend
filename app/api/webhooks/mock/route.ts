// app/api/webhooks/mock/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

const Schema = z.object({
  event: z.string().optional(),
  provider_payment_id: z.string().min(1),
  order_id: z.number().int().positive(),
  status: z.enum(["succeeded", "canceled", "failed"]),
  raw: z.any().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten(), got: body }, { status: 400 });
  }

  const { provider_payment_id, order_id, status } = parsed.data;

  const p = await prisma.payment.findUnique({ where: { providerPaymentId: provider_payment_id } });
  if (!p) return NextResponse.json({ ok: false, error: "payment not found" }, { status: 404 });

  await prisma.payment.update({
    where: { providerPaymentId: provider_payment_id },
    data: { status, webhookRaw: JSON.stringify(body) },
  });

  if (status === "succeeded") {
    await prisma.order.update({ where: { id: order_id }, data: { status: "PAID" } });
  } else if (status === "canceled") {
    await prisma.order.update({ where: { id: order_id }, data: { status: "CANCELED" } });
  }

  return NextResponse.json({ ok: true });
}
