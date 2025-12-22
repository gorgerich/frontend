"use client";

import { useState } from "react";

export default function PayPage() {
  const [loading, setLoading] = useState<null | "card" | "sbp">(null);

  async function startPayment(method: "card" | "sbp") {
    setLoading(method);

    // 1) создаём заказ через существующий /api/orders
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { email: "test@example.com", name: "Test" },
        ceremony: { type: method === "sbp" ? "BURIAL" : "BURIAL" },
        services: [
          { name: "Организация церемонии", price: 120000, quantity: 1 }, // рубли
        ],
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      setLoading(null);
      alert("order error: " + JSON.stringify(orderData));
      return;
    }

    const orderId: number = orderData.orderId;
    const amount: number = orderData.totalAmount; // копейки

    // 2) создаём платёж
    const payRes = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount, method }),
    });

    const payData = await payRes.json();
    setLoading(null);

    if (!payRes.ok) {
      alert("payment error: " + JSON.stringify(payData));
      return;
    }

    window.location.href = payData.payUrl; // /checkout/mock/...
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Оплата заказа</h1>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>Выберите способ оплаты</div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          disabled={!!loading}
          onClick={() => startPayment("card")}
          style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          {loading === "card" ? "Переходим к оплате..." : "Оплатить картой"}
        </button>

        <button
          disabled={!!loading}
          onClick={() => startPayment("sbp")}
          style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          {loading === "sbp" ? "Готовим QR..." : "Оплатить по СБП"}
        </button>
      </div>
    </div>
  );
}