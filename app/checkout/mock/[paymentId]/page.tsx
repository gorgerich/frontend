// app/checkout/mock/[paymentId]/page.tsx
import { PrismaClient } from "@prisma/client";
import MockCheckoutUI from "./ui";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export default async function Page({
  params,
  searchParams,
}: {
  params: { paymentId: string };
  searchParams: { orderId?: string; method?: string };
}) {
  const paymentId = params.paymentId;

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: paymentId },
  });

  if (!payment) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
          <div className="text-xl font-semibold">Платёж не найден</div>
          <div className="mt-2 text-white/70 break-words">paymentId: {paymentId}</div>
        </div>
      </div>
    );
  }

  const method = (searchParams.method ?? "card") as "card" | "sbp";

  return (
    <MockCheckoutUI
      payment={{
        providerPaymentId: payment.providerPaymentId,
        orderId: payment.orderId, // Int из БД
        amount: payment.amount,   // копейки из БД
        currency: payment.currency,
        status: payment.status,
        method,
      }}
    />
  );
}
