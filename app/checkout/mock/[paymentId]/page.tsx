// app/checkout/mock/[paymentId]/page.tsx
import MockCheckoutUI from "./ui";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { paymentId: string };
type Search = { orderId?: string; method?: string };

export default async function Page({
  params,
  searchParams,
}: {
  params: Params | Promise<Params>;
  searchParams: Search | Promise<Search>;
}) {
  const p = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams);

  const paymentId = p?.paymentId;

  // ВАЖНО: не даём Prisma получить undefined
  if (!paymentId || typeof paymentId !== "string") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
          <div className="text-xl font-semibold">Некорректный paymentId</div>
          <div className="mt-2 text-white/70 break-words">
            params.paymentId: {String(paymentId)}
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
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
          <div className="text-xl font-semibold">Платёж не найден</div>
          <div className="mt-2 text-white/70 break-words">paymentId: {paymentId}</div>
        </div>
      </div>
    );
  }

  const method = ((sp as any)?.method ?? "card") as "card" | "sbp";
  const orderId = (sp as any)?.orderId ?? payment.orderPublicId ?? String(payment.orderId);

  return (
    <MockCheckoutUI
      payment={{
        providerPaymentId: payment.providerPaymentId,
        orderId: String(orderId),
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method,
      }}
    />
  );
}
