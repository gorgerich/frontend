"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

function formatRubKopeks(amount: number) {
  const rub = Math.floor(amount / 100);
  const kop = amount % 100;
  return `${rub.toLocaleString("ru-RU")},${String(kop).padStart(2, "0")} ₽`;
}

export default function MockCheckoutPage() {
  const params = useParams<{ paymentId: string }>();
  const search = useSearchParams();

  const paymentId = params.paymentId;
  const orderId = Number(search.get("orderId"));
  const initialMethod = (search.get("method") as "card" | "sbp" | null) ?? "card";

  const [method, setMethod] = useState<"card" | "sbp">(initialMethod);
  const [status, setStatus] = useState<"pending" | "succeeded" | "canceled" | "failed">("pending");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>(120000); // покажем сумму “как в заказе” (для красоты)
  const [msg, setMsg] = useState<string>("");

  // QR-строка для демо (не настоящий формат СБП, но UX-похожий)
  const sbpPayload = useMemo(() => {
    const safeOrder = Number.isFinite(orderId) ? orderId : 0;
    return `tihiydom://pay?order=${safeOrder}&payment=${paymentId}&amount=${amount}`;
  }, [orderId, paymentId, amount]);

  // QR через Google Chart API (быстро и без libs)
  const qrUrl = useMemo(() => {
    const encoded = encodeURIComponent(sbpPayload);
    return `https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encoded}`;
  }, [sbpPayload]);

  async function sendWebhook(next: "succeeded" | "canceled" | "failed") {
    if (!Number.isFinite(orderId)) {
      setMsg("orderId отсутствует или не число. Вернись на /pay и создай оплату заново.");
      return;
    }

    setLoading(true);
    setMsg("");

    const res = await fetch("/api/webhooks/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_payment_id: paymentId,
        order_id: orderId,
        status: next,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg("Webhook error: " + JSON.stringify(data));
      return;
    }

    setStatus(next);
    setMsg(`Статус обновлён: ${next}`);
  }

  const badge = (() => {
    if (status === "pending") return { text: "Ожидаем оплату", bg: "#FFF7D6", color: "#6A4B00" };
    if (status === "succeeded") return { text: "Оплачено", bg: "#E8FFF0", color: "#0B5A2A" };
    if (status === "canceled") return { text: "Отменено", bg: "#FFECEC", color: "#7A0B0B" };
    return { text: "Ошибка", bg: "#FFECEC", color: "#7A0B0B" };
  })();

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#f6f7f9" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e6e8ee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Оплата</div>
              <div style={{ opacity: 0.65, marginTop: 4 }}>Тихий дом • Заказ #{Number.isFinite(orderId) ? orderId : "—"}</div>
            </div>

            <div style={{ padding: "6px 10px", borderRadius: 999, background: badge.bg, color: badge.color, fontWeight: 600 }}>
              {badge.text}
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid #eef0f4", paddingTop: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{formatRubKopeks(amount)}</div>
            <div style={{ opacity: 0.6, marginTop: 4 }}>Платёж: {paymentId}</div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setMethod("card")}
              disabled={loading}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: method === "card" ? "#111827" : "white",
                color: method === "card" ? "white" : "#111827",
                fontWeight: 600,
              }}
            >
              Банковская карта
            </button>
            <button
              type="button"
              onClick={() => setMethod("sbp")}
              disabled={loading}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: method === "sbp" ? "#111827" : "white",
                color: method === "sbp" ? "white" : "#111827",
                fontWeight: 600,
              }}
            >
              СБП
            </button>
          </div>

          {method === "card" ? (
            <div style={{ marginTop: 16, border: "1px solid #eef0f4", borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Оплата картой</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                <input placeholder="Номер карты" disabled={loading} style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
                <input placeholder="MM/YY" disabled={loading} style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
                <input placeholder="Имя на карте" disabled={loading} style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
                <input placeholder="CVC" disabled={loading} style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={loading || status !== "pending"}
                  onClick={() => sendWebhook("succeeded")}
                  style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#111827", color: "white", fontWeight: 700 }}
                >
                  Оплатить
                </button>

                <button
                  type="button"
                  disabled={loading || status !== "pending"}
                  onClick={() => sendWebhook("canceled")}
                  style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "white", fontWeight: 700 }}
                >
                  Отмена
                </button>

                <button
                  type="button"
                  disabled={loading || status !== "pending"}
                  onClick={() => sendWebhook("failed")}
                  style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "white", fontWeight: 700 }}
                >
                  Ошибка
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, border: "1px solid #eef0f4", borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Оплата по СБП</div>

              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 240, height: 240, borderRadius: 12, border: "1px solid #ddd", overflow: "hidden", background: "white" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR СБП" width={240} height={240} />
                </div>

                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ opacity: 0.75, lineHeight: 1.45 }}>
                    1) Откройте приложение банка<br />
                    2) Выберите “Оплата по QR / СБП”<br />
                    3) Отсканируйте код и подтвердите оплату
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={loading || status !== "pending"}
                      onClick={() => sendWebhook("succeeded")}
                      style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#111827", color: "white", fontWeight: 700 }}
                    >
                      Я оплатил
                    </button>

                    <button
                      type="button"
                      disabled={loading || status !== "pending"}
                      onClick={() => sendWebhook("canceled")}
                      style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "white", fontWeight: 700 }}
                    >
                      Отмена
                    </button>
                  </div>

                  <div style={{ marginTop: 10, opacity: 0.6, fontSize: 12 }}>
                    Это эмулятор: QR демонстрационный, webhook отправляется внутри вашего приложения.
                  </div>
                </div>
              </div>
            </div>
          )}

          {msg && <pre style={{ marginTop: 14, whiteSpace: "pre-wrap", background: "#f6f7f9", padding: 12, borderRadius: 12 }}>{msg}</pre>}
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e6e8ee", height: "fit-content" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Параметры</div>
          <div style={{ opacity: 0.75, fontSize: 13, lineHeight: 1.5 }}>
            <div><b>paymentId:</b> {paymentId}</div>
            <div><b>orderId:</b> {Number.isFinite(orderId) ? orderId : "—"}</div>
            <div><b>status:</b> {status}</div>
            <div><b>method:</b> {method}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Сумма (для демо)</div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
              disabled={loading}
            />
            <div style={{ marginTop: 6, opacity: 0.6, fontSize: 12 }}>В копейках. В реальности берётся из заказа.</div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/pay" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", textDecoration: "none", color: "#111827", fontWeight: 700 }}>
              Вернуться
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
