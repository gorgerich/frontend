"use client";

import { useState } from "react";

export default function PayPage() {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const orderId = "ord_100500";
  const amount = 120000; // копейки = 1200 ₽

  async function pay(method: "card" | "sbp") {
    setLoading(true);
    setQrUrl(null);

    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount, method, description: `Оплата заказа #${orderId}` }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(JSON.stringify(data));
      return;
    }

    if (method === "card") {
      window.location.href = data.payUrl; // редирект на оплату
      return;
    }

    // СБП: показать QR
    setQrUrl(data.qr.qrImageUrl);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Оплата заказа</h1>

      <button disabled={loading} onClick={() => pay("card")}>
        Оплатить картой
      </button>

      <button disabled={loading} onClick={() => pay("sbp")} style={{ marginLeft: 12 }}>
        Оплатить по СБП
      </button>

      {qrUrl && (
        <div style={{ marginTop: 24 }}>
          <div>Сканируйте QR в банке:</div>
          <img src={qrUrl} alt="SBP QR" style={{ width: 240, height: 240 }} />
        </div>
      )}
    </div>
  );
}
