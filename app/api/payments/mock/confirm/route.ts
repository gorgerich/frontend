import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";

export const runtime = "nodejs";

const ReqSchema = z.object({
  providerPaymentId: z.string().min(5),
  status: z.enum(["succeeded", "failed", "canceled"]).default("succeeded"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ReqSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { providerPaymentId, status } = parsed.data;

  const updated = await prisma.payment.update({
    where: { providerPaymentId },
    data: {
      status,
      webhookRaw: JSON.stringify({
        ts: new Date().toISOString(),
        provider: "mock",
        status,
      }),
    },
  });

  return NextResponse.json({ ok: true, payment: updated });
}
