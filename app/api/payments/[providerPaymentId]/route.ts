import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ providerPaymentId: string }> }
) {
  const { providerPaymentId } = await ctx.params;

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId },
    select: {
      providerPaymentId: true,
      orderId: true,
      amount: true,
      currency: true,
      status: true,
      confirmationUrl: true,
    },
  });

  if (!payment) {
    return NextResponse.json(
      { ok: false, error: "payment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, payment });
}
