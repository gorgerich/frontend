// app/checkout/mock/[paymentId]/page.tsx
import { prisma } from "@/lib/prisma";
import MockCheckoutUI from "./ui";

export const runtime = "nodejs";

export default async function Page({
  params,
  searchParams,
}: {
  params: { paymentId: string };
  searchParams: { orderId?: string; method?: string; payPlan?: string };
}) {
  const paymentId = params.paymentId;

  // Жёсткая проверка — чтобы больше не ловить providerPaymentId: undefined
  if (!paymentId || typeof paymentId !== "string") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
          <div className="text-xl font-semibold">Некорректный идентификатор платежа</div>
        </div>
      </div>
    );
  }

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

  const meta = payment.createRaw ? JSON.parse(payment.createRaw) : null;

  return (
    <MockCheckoutUI
      payment={{
        providerPaymentId: payment.providerPaymentId,
        orderId: payment.orderPublicId, // publicId заказа
        amount: payment.amount,         // к оплате сейчас
        currency: payment.currency,
        status: payment.status,
        method,
        payPlan: meta?.payPlan,
        meta,
      }}
    />
  );
}
