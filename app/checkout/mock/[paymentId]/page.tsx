"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function MockCheckout({ params }: any) {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("orderId");

  function success() {
    router.push(`/payment/success?orderId=${orderId}`);
  }

  function fail() {
    router.push(`/payment/fail?orderId=${orderId}`);
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", fontFamily: "system-ui" }}>
      <h2>Оплата банковской картой</h2>

      <input placeholder="Номер карты" style={{ width: "100%", marginBottom: 12 }} />
      <input placeholder="MM / YY" style={{ width: "48%", marginRight: "4%" }} />
      <input placeholder="CVC" style={{ width: "48%" }} />

      <button onClick={success} style={{ marginTop: 20, width: "100%" }}>
        Оплатить
      </button>

      <button onClick={fail} style={{ marginTop: 8, width: "100%" }}>
        Отменить
      </button>
    </div>
  );
}
