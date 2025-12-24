import { PrismaClient } from "@prisma/client";
import MockCheckoutUI from "./ui";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export default async function Page({
  params,
  searchParams,
}: {
  params: { paymentId?: string };
  searchParams: {
    orderId?: string;
    method?: string;
    nxtPaymentId?: string;
  };
}) {
  const paymentId =
    params.paymentId ||
    searchParams.nxtPaymentId ||
    undefined;

  if (!paymentId) {
    return (
      <CenteredError text="Некорректный идентификатор платежа" />
    );
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { providerPaymentId: paymentId },
        { orderPublicId: searchParams.orderId },
      ],
    },
  });

  if (!payment) {
    return (
      <CenteredError text="Платёж не найден" />
    );
  }

  const method =
    (searchParams.method as "card" | "sbp") || "card";

  return (
    <MockCheckoutUI
      payment={{
        providerPaymentId: payment.providerPaymentId,
        orderId: payment.orderPublicId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method,
      }}
    />
  );
}

function CenteredError({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="rounded-2xl border border-gray-200 px-8 py-6 text-gray-900 text-lg font-medium">
        {text}
      </div>
    </div>
  );
}
