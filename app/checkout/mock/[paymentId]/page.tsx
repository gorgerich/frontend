// app/checkout/mock/[paymentId]/page.tsx
import { prisma } from "@/lib/prisma";
import MockCheckoutUI from "./ui";

export const runtime = "nodejs";

export default async function Page({
  params,
  searchParams,
}: {
  params?: { paymentId?: string };
  searchParams?: { orderId?: string; method?: string; payPlan?: string; nxtPaymentId?: string; paymentId?: string };
}) {
  // 1) основной вариант: /checkout/mock/<paymentId>
  // 2) запасной вариант: /checkout/mock?paymentId=<...> или ?nxtPaymentId=<...>
  const paymentId =
    (params?.paymentId && typeof params.paymentId === "string" ? params.paymentId : "") ||
    (searchParams?.nxtPaymentId && typeof searchParams.nxtPaymentId === "string" ? searchParams.nxtPaymentId : "") ||
    (searchParams?.paymentId && typeof searchParams.paymentId === "string" ? searchParams.paymentId : "");

  if (!paymentId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-6 text-black">
          <div className="text-xl font-semibold">Некорректный идентификатор платежа</div>

          <div className="mt-4 text-sm text-black/70">
            <div className="font-medium">Диагностика:</div>
            <div className="mt-2">
              <div>params.paymentId: {String(params?.paymentId ?? "")}</div>
              <div>searchParams.nxtPaymentId: {String(searchParams?.nxtPaymentId ?? "")}</div>
              <div>searchParams.paymentId: {String(searchParams?.paymentId ?? "")}</div>
            </div>
          </div>
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
        <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-6 text-black">
          <div className="text-xl font-semibold">Платёж не найден</div>
          <div className="mt-2 text-black/70 break-words">paymentId: {paymentId}</div>
        </div>
      </div>
    );
  }

  const method = (searchParams?.method ?? "card") as "card" | "sbp";
  const meta = payment.createRaw ? JSON.parse(payment.createRaw) : null;

  return (
    <MockCheckoutUI
      payment={{
        providerPaymentId: payment.providerPaymentId,
        orderId: payment.orderPublicId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method,
        payPlan: meta?.payPlan,
        meta,
      }}
    />
  );
}
