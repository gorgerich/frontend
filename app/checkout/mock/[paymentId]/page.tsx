"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function MockCheckoutPage({
  params,
}: {
  params: { paymentId: string };
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();

  function paySuccess() {
    router.push(`/payment-success?orderId=${orderId}`);
  }

  function payFail() {
    router.push(`/payment-failed?orderId=${orderId}`);
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Оплата заказа</h1>
      <p>Платёж: <b>{params.paymentId}</b></p>
      <p>Заказ: <b>{orderId}</b></p>

      <button onClick={paySuccess} style={{ width: "100%", padding: 12, marginTop: 12 }}>
        Оплатить (успешно)
      </button>

      <button
        onClick={payFail}
        style={{ width: "100%", padding: 12, marginTop: 8, opacity: 0.6 }}
      >
        Ошибка оплаты
      </button>
    </div>
  );
}
