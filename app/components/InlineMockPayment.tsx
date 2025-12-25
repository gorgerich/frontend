"use client";

import { useMemo, useState } from "react";

type PayPlan = "full" | "deposit" | "split";

type Props = {
  orderId: string;       // publicId, например order_xxx
  totalAmount: number;   // RUB (целое), например 204000
  email: string;
};

function rub(n: number) {
  return n.toLocaleString("ru-RU");
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function InlineMockPayment({ orderId, totalAmount, email }: Props) {
  const [payPlan, setPayPlan] = useState<PayPlan>("full");
  const [method, setMethod] = useState<"card" | "sbp">("card");

  const [cardNumber, setCardNumber] = useState("");
  const [holder, setHolder] = useState("IVAN IVANOV");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const [contactEmail, setContactEmail] = useState(email);

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalKopeks = useMemo(() => Math.max(0, Math.round(totalAmount * 100)), [totalAmount]);

  const payNowKopeks = useMemo(() => {
    if (payPlan === "deposit") return Math.max(1, Math.round(totalKopeks * 0.05));
    if (payPlan === "split") return Math.max(1, Math.round(totalKopeks * 0.25));
    return totalKopeks;
  }, [payPlan, totalKopeks]);

  const payNowRub = useMemo(() => Math.round(payNowKopeks / 100), [payNowKopeks]);

  const splitSchedule = useMemo(() => {
    const now = new Date();
    const p1 = Math.max(1, Math.round(totalKopeks * 0.25));
    const p2 = p1;
    const p3 = p1;
    const p4 = Math.max(0, totalKopeks - (p1 + p2 + p3)); // остаток
    return [
      { title: "Сегодня", date: formatDate(now), amount: Math.round(p1 / 100) },
      { title: "2 недели", date: formatDate(addDays(now, 14)), amount: Math.round(p2 / 100) },
      { title: "4 недели", date: formatDate(addDays(now, 28)), amount: Math.round(p3 / 100) },
      { title: "6 недель", date: formatDate(addDays(now, 42)), amount: Math.round(p4 / 100) },
    ];
  }, [totalKopeks]);

  const canPay = useMemo(() => {
    if (paid) return false;
    if (!contactEmail || !contactEmail.includes("@")) return false;

    if (method === "sbp") return true;

    const digits = cardNumber.replace(/\D/g, "");
    const cardOk = digits.length >= 12;
    const expOk = /^\d{2}\/\d{2}$/.test(exp);
    const cvcOk = /^\d{3,4}$/.test(cvc);
    return cardOk && expOk && cvcOk;
  }, [paid, contactEmail, method, cardNumber, exp, cvc]);

  async function createPayment() {
    const r = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, method, payPlan }),
    });

    const j = await r.json();
    if (!r.ok || !j?.ok) {
      throw new Error(j?.error ? JSON.stringify(j.error) : "create payment failed");
    }
    return j as {
      ok: true;
      providerPaymentId: string;
      payPlan: PayPlan;
      payNowAmount: number;
      totalAmount: number;
    };
  }

  async function confirmPayment(providerPaymentId: string) {
    const r = await fetch("/api/payments/mock/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerPaymentId, status: "succeeded" }),
    });

    const j = await r.json();
    if (!r.ok || !j?.ok) {
      throw new Error(j?.error ? JSON.stringify(j.error) : "confirm payment failed");
    }
  }

  async function onPay() {
    setError(null);
    setLoading(true);

    try {
      const created = await createPayment();
      await new Promise((res) => setTimeout(res, 600)); // UX-ожидание
      await confirmPayment(created.providerPaymentId);
      setPaid(true);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="text-lg font-semibold text-white">Способ оплаты</div>

        {/* 3 варианта оплаты */}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <PlanBtn
            active={payPlan === "full"}
            title="Оплатить всю сумму"
            subtitle={`Итого ${rub(totalAmount)} ₽`}
            onClick={() => setPayPlan("full")}
          />
          <PlanBtn
            active={payPlan === "deposit"}
            title="Оплатить депозит"
            subtitle={`5% сейчас: ${rub(Math.round(totalAmount * 0.05))} ₽`}
            onClick={() => setPayPlan("deposit")}
          />
          <PlanBtn
            active={payPlan === "split"}
            title="Оплатить сплитом"
            subtitle="4 платежа без переплат (UX)"
            onClick={() => setPayPlan("split")}
          />
        </div>

        {/* График сплита */}
        {payPlan === "split" && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-medium text-white">График платежей</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {splitSchedule.map((x) => (
                <div key={x.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/60">{x.title}</div>
                  <div className="mt-1 text-sm text-white">{x.date}</div>
                  <div className="mt-2 text-base font-semibold text-white">{rub(x.amount)} ₽</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Способ: карта / СБП */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MethodBtn active={method === "card"} title="Карта" onClick={() => setMethod("card")} />
          <MethodBtn active={method === "sbp"} title="СБП" onClick={() => setMethod("sbp")} />
        </div>

        {/* Основная форма */}
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-medium text-white/80">Данные карты</div>

            {method === "card" ? (
              <div className="mt-4 grid gap-4">
                <Field label="Номер карты">
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(maskCard(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
                    inputMode="numeric"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Держатель карты">
                    <input
                      value={holder}
                      onChange={(e) => setHolder(e.target.value.slice(0, 40))}
                      placeholder="IVAN IVANOV"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
                    />
                  </Field>

                  <Field label="Срок действия (MM/YY)">
                    <input
                      value={exp}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d/]/g, "").slice(0, 5);
                        if (v.length === 2 && !v.includes("/")) setExp(v + "/");
                        else setExp(v);
                      }}
                      placeholder="MM/YY"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
                      inputMode="numeric"
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                СБП (UX). Для теста просто нажми «Оплатить».
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-medium text-white/80">CVC/CVV</div>
              <div className="mt-3">
                <input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="***"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
                  inputMode="numeric"
                  disabled={method !== "card"}
                />
              </div>
              <div className="mt-2 text-xs text-white/50">3 цифры на обратной стороне карты</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-medium text-white/80">Email для получения информации</div>
              <div className="mt-3">
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value.slice(0, 120))}
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
                />
              </div>
              <div className="mt-2 text-xs text-white/50">
                На этот адрес придёт подтверждение заказа и документы.
              </div>
            </div>
          </div>
        </div>

        {/* Итоги + кнопка */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white/80">
            <div className="text-xs text-white/50">К оплате сейчас</div>
            <div className="text-2xl font-semibold text-white">{rub(payNowRub)} ₽</div>
            {payPlan !== "full" && (
              <div className="mt-1 text-xs text-white/50">
                Полная сумма заказа: {rub(totalAmount)} ₽
              </div>
            )}
          </div>

          <button
            onClick={onPay}
            disabled={!canPay || loading}
            className="h-12 rounded-2xl bg-white px-6 text-sm font-semibold text-black disabled:opacity-50"
          >
            {paid ? "Оплачено" : loading ? "Обрабатываем..." : `Оплатить ${rub(payNowRub)} ₽`}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            Ошибка оплаты: {error}
          </div>
        )}

        {paid && (
          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Платёж успешен. (UX-эмулятор)
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PlanBtn({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left rounded-2xl border px-4 py-3 transition",
        active
          ? "border-white/30 bg-white/10"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-white/60">{subtitle}</div>
    </button>
  );
}

function MethodBtn({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-3 text-sm font-medium transition",
        active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {title}
    </button>
  );
}

function maskCard(n: string) {
  const digits = n.replace(/\D/g, "").slice(0, 16);
  const parts = digits.match(/.{1,4}/g) ?? [];
  return parts.join(" ");
}
