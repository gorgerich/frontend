"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}
function formatMMYY(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}
function luhnCheck(card: string) {
  const digits = card.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}
function detectBrand(card: string) {
  const d = card.replace(/\D/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^5[1-5]/.test(d)) return "Mastercard";
  if (/^2/.test(d)) return "МИР";
  return "Банк";
}

export default function MockCheckout({ params }: any) {
  const router = useRouter();
  const search = useSearchParams();

  const paymentId = params?.paymentId as string;
  const orderId = search.get("orderId") || "";
  const method = search.get("method") || "card";

  // Можно передавать amount в query позже, но пока покажем базовую инфу
  const merchant = "Тихий дом";
  const descriptor = "Услуги по организации церемонии";
  const supportPhone = "+7 (495) 123-45-67";

  const [cardNumber, setCardNumber] = useState("");
  const [mmyy, setMmyy] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholder, setCardholder] = useState("");

  const [stage, setStage] = useState<"form" | "processing" | "3ds">("form");
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const brand = useMemo(() => detectBrand(cardNumber), [cardNumber]);

  const isValid = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, "");
    const exp = mmyy.replace(/\D/g, "");
    const mm = Number(exp.slice(0, 2));
    const yy = Number(exp.slice(2, 4));
    const cvcDigits = cvc.replace(/\D/g, "");
    if (digits.length !== 16) return false;
    if (!luhnCheck(cardNumber)) return false;
    if (exp.length !== 4) return false;
    if (!(mm >= 1 && mm <= 12)) return false;
    if (yy < 0 || yy > 99) return false;
    if (cvcDigits.length !== 3) return false;
    return true;
  }, [cardNumber, mmyy, cvc]);

  async function sendWebhook(status: "succeeded" | "canceled" | "failed") {
    // ВАЖНО: подстрой путь под твой webhook mock
    // Если у тебя уже есть /api/webhooks/mock - оставь как есть
    const res = await fetch("/api/webhooks/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "payment.status",
        provider_payment_id: paymentId,
        order_id: orderId,
        status,
      }),
    });

    // Даже если webhook упадёт, UX должен продолжить
    // но лог полезен
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn("mock webhook failed", res.status, data);
    }
  }

  async function pay() {
    setError(null);

    if (!orderId) {
      setError("Нет orderId. Вернись на сайт и начни оплату заново.");
      return;
    }
    if (!isValid) {
      setError("Проверь данные карты. Номер/срок/CVC заполнены неверно.");
      return;
    }

    setLoading(true);
    setStage("processing");

    // имитация процессинга
    await new Promise((r) => setTimeout(r, 900));

    // Имитируем 3DS для “правдоподобия”
    setStage("3ds");
    setLoading(false);
  }

  async function confirm3ds() {
    setError(null);
    if (otp.trim() !== "1234") {
      setError("Неверный код. Попробуй 1234.");
      return;
    }
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    await sendWebhook("succeeded");

    setLoading(false);
    router.push(`/payment/success?orderId=${encodeURIComponent(orderId)}`);
  }

  async function cancel() {
    setError(null);
    setLoading(true);

    await sendWebhook("canceled");

    setLoading(false);
    router.push(`/payment/fail?orderId=${encodeURIComponent(orderId)}`);
  }

  // небольшой косметический скролл к верху
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 50% -50%, rgba(0,0,0,0.08), transparent), #f4f6f8",
        padding: "48px 16px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#111",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 20,
        }}
      >
        {/* LEFT - payment card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              background:
                "linear-gradient(90deg, rgba(13,17,23,0.04), rgba(13,17,23,0.0))",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: "#555" }}>Оплата</div>
              <div style={{ fontSize: 18, fontWeight: 650 }}>
                Банковской картой
              </div>
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#555",
                textAlign: "right",
                lineHeight: 1.35,
              }}
            >
              <div style={{ fontWeight: 600 }}>{merchant}</div>
              <div>{descriptor}</div>
              <div style={{ color: "#777" }}>Поддержка: {supportPhone}</div>
            </div>
          </div>

          <div style={{ padding: 22 }}>
            {method !== "card" ? (
              <div
                style={{
                  padding: 14,
                  background: "#fff7e6",
                  border: "1px solid #ffe3ad",
                  borderRadius: 12,
                  color: "#7a4b00",
                  marginBottom: 14,
                }}
              >
                Сейчас открыт эмулятор оплаты картой. Для СБП сделаем отдельный
                экран (QR/ссылка).
              </div>
            ) : null}

            {/* Card preview */}
            <div
              style={{
                borderRadius: 16,
                padding: 18,
                background:
                  "linear-gradient(135deg, rgba(18, 24, 33, 0.92), rgba(18, 24, 33, 0.78))",
                color: "rgba(255,255,255,0.92)",
                marginBottom: 18,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(600px 200px at 10% 10%, rgba(255,255,255,0.18), transparent)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>MOCK BANK</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{brand}</div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 18,
                  letterSpacing: 2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {(cardNumber || "0000 0000 0000 0000").padEnd(19, "0")}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 12,
                  opacity: 0.92,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ opacity: 0.7, fontSize: 10 }}>Держатель</div>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 240,
                    }}
                  >
                    {cardholder || "NAME SURNAME"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ opacity: 0.7, fontSize: 10 }}>Срок</div>
                  <div>{mmyy || "MM/YY"}</div>
                </div>
              </div>
            </div>

            {/* Form / 3DS */}
            {stage === "3ds" ? (
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  background: "#fbfbfc",
                }}
              >
                <div style={{ fontWeight: 650, marginBottom: 6 }}>
                  Подтверждение 3-D Secure
                </div>
                <div style={{ fontSize: 13, color: "#555", marginBottom: 14 }}>
                  Введите код из SMS. Для теста: <b>1234</b>
                </div>

                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Код из SMS"
                  style={{
                    width: "100%",
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    outline: "none",
                    fontSize: 16,
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: 12,
                  }}
                />

                <button
                  onClick={confirm3ds}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    fontWeight: 650,
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Проверяем…" : "Подтвердить"}
                </button>

                <button
                  onClick={cancel}
                  disabled={loading}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.14)",
                    background: "#fff",
                    color: "#111",
                    fontWeight: 600,
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  Отменить
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
                      Номер карты
                    </div>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                      style={{
                        width: "100%",
                        padding: "12px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.14)",
                        outline: "none",
                        fontSize: 16,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    />
                    <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                      Для теста подойдёт любой номер, проходящий Luhn. Например:
                      4242 4242 4242 4242
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
                        Срок действия
                      </div>
                      <input
                        value={mmyy}
                        onChange={(e) => setMmyy(formatMMYY(e.target.value))}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        style={{
                          width: "100%",
                          padding: "12px 12px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.14)",
                          outline: "none",
                          fontSize: 16,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
                        CVC
                      </div>
                      <input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="123"
                        inputMode="numeric"
                        style={{
                          width: "100%",
                          padding: "12px 12px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.14)",
                          outline: "none",
                          fontSize: 16,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>
                      Держатель карты (необязательно)
                    </div>
                    <input
                      value={cardholder}
                      onChange={(e) => setCardholder(e.target.value.slice(0, 26))}
                      placeholder="NAME SURNAME"
                      style={{
                        width: "100%",
                        padding: "12px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.14)",
                        outline: "none",
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                {error ? (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 12,
                      background: "#fff1f1",
                      border: "1px solid #ffd1d1",
                      color: "#8a1f1f",
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                  <button
                    onClick={pay}
                    disabled={loading || !isValid}
                    style={{
                      width: "100%",
                      padding: "13px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#111",
                      color: "#fff",
                      fontWeight: 650,
                      cursor: loading || !isValid ? "default" : "pointer",
                      opacity: loading || !isValid ? 0.65 : 1,
                    }}
                  >
                    {stage === "processing" ? "Обработка…" : "Оплатить"}
                  </button>

                  <button
                    onClick={cancel}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "13px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.14)",
                      background: "#fff",
                      color: "#111",
                      fontWeight: 600,
                      cursor: loading ? "default" : "pointer",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    Отменить
                  </button>

                  <div style={{ fontSize: 12, color: "#777", lineHeight: 1.35 }}>
                    Платёж защищён. Данные карты не сохраняются на сервере.
                    <br />
                    Payment ID: <span style={{ fontFamily: "ui-monospace" }}>{paymentId}</span>
                    {orderId ? (
                      <>
                        {" "}• Order ID:{" "}
                        <span style={{ fontFamily: "ui-monospace" }}>{orderId}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT - summary */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
            padding: 18,
            height: "fit-content",
          }}
        >
          <div style={{ fontSize: 14, color: "#555" }}>Детали</div>
          <div style={{ fontSize: 16, fontWeight: 650, marginTop: 4 }}>
            {merchant}
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "#555", lineHeight: 1.5 }}>
            {descriptor}
            <br />
            Метод: {method === "card" ? "Карта" : method.toUpperCase()}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              background: "#f6f7f8",
              border: "1px solid rgba(0,0,0,0.05)",
              fontSize: 13,
              color: "#333",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Комиссия</span>
              <span>0 ₽</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ color: "#666" }}>Итого</span>
              <span style={{ fontWeight: 700 }}>Оплата</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
              Примечание: сумму можно подтянуть из БД (Payment.amount) — скажешь, сделаю.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
