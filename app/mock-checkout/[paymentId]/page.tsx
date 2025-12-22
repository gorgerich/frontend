"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useState } from "react";

export default function MockCheckout() {
  const params = useParams<{ paymentId: string }>();
  const search = useSearchParams();
  const orderId = search.get("orderId") || "";
  const paymentId = params.paymentId;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send(status: "succeeded" | "canceled" | "failed") {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/webhooks/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: `payment.${status}`,
        provider_payment_id: paymentId,
        order_id: orderId,
        status,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setResult("Ошибка: " + JSON.stringify(data));
      return;
    }

    setResult("OK: " + status);

    // можно редиректить на страницу успеха
    // window.location.href = `/pay/success?orderId=${encodeURIComponent(orderId)}`
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1>Mock Checkout</h1>
      <div>Payment: {paymentId}</div>
      <div>Order: {orderId}</div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button type="button" disabled={loading} onClick={() => send("succeeded")}>
          Оплатить
        </button>
        <button type="button" disabled={loading} onClick={() => send("canceled")}>
          Отменить
        </button>
        <button type="button" disabled={loading} onClick={() => send("failed")}>
          Ошибка
        </button>
      </div>

      {result && <pre style={{ marginTop: 16 }}>{result}</pre>}
    </div>
  );
}
