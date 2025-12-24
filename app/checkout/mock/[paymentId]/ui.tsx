"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentDTO = {
  providerPaymentId: string;
  orderId: number;
  amount: number; // копейки
  currency: string;
  status: string;
  method: "card" | "sbp";
};

function formatRub(amountKopeks: number) {
  const rub = amountKopeks / 100;
  return rub.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function maskCard(n: string) {
  const digits = n.replace(/\D/g, "").slice(0, 16);
  const parts = digits.match(/.{1,4}/g) ?? [];
  return parts.join(" ");
}

export default function MockCheckoutUI({ payment }: { payment: PaymentDTO }) {
  const router = useRouter();
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const totalText = useMemo(() => formatRub(payment.amount), [payment.amount]);

  const isCardOk = useMemo(() => {
    const digits = card.replace(/\D/g, "");
    return digits.length >= 12; // “похоже на карту”, без Luhn-валидации, чтобы не мешать тестам
  }, [card]);

  const isExpOk = useMemo(() => {
    // MM/YY
    return /^\d{2}\/\d{2}$/.test(exp);
  }, [exp]);

  const isCvcOk = useMemo(() => /^\d{3,4}$/.test(cvc), [cvc]);

  const canPay = payment.method === "card" ? isCardOk && isExpOk && isCvcOk : true;

  async function onPay() {
    setLoading(true);

    // Вариант A: для моков можно просто “успешно оплатить” и вернуться назад.
    // Если хочешь — сделаем отдельный /api/webhooks/mock чтобы менять статус в БД.
    setTimeout(() => {
      setLoading(false);
      alert("Оплата прошла успешно (эмулятор).");
      router.push("/"); // или на страницу “успеха”
    }, 700);
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-[980px] px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-white/60">Оплата</div>
                <h1 className="mt-1 text-2xl font-semibold">Банковской картой</h1>
                <div className="mt-2 text-sm text-white/60">
                  Тихий дом • Заказ #{payment.orderId} • Платёж {payment.providerPaymentId}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                <div className="text-xs text-white/60">К оплате</div>
                <div className="mt-1 text-xl font-semibold">{totalText} ₽</div>
                <div className="mt-1 text-xs text-white/50">Комиссия 0 ₽</div>
              </div>
            </div>

            {/* Card preview */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-5 border border-white/10">
                <div className="text-xs text-white/60">MOCK BANK</div>
                <div className="mt-6 text-lg tracking-widest">
                  {maskCard(card) || "5536 9141 4659 6634"}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-white/50">Держатель</div>
                    <div className="text-sm">{name || "NAME SURNAME"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/50">Срок</div>
                    <div className="text-sm">{exp || "MM/YY"}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-medium">Детали</div>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span>Метод</span>
                    <span className="text-white">{payment.method === "card" ? "Карта" : "СБП"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Статус</span>
                    <span className="text-white">{payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Сумма</span>
                    <span className="text-white">{totalText} ₽</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                  Тестовый шлюз. Данные не сохраняются как платёжные реквизиты.
                </div>
              </div>
            </div>

            {/* Form */}
            {payment.method === "card" ? (
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="text-sm text-white/70">Номер карты</label>
                  <input
                    value={card}
                    onChange={(e) => setCard(maskCard(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/25"
                    inputMode="numeric"
                  />
                  <div className="mt-2 text-xs text-white/50">
                    Для теста подойдёт любой номер. Например: 4242 4242 4242 4242
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Срок действия</label>
                    <input
                      value={exp}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d/]/g, "").slice(0, 5);
                        // автослэш
                        if (v.length === 2 && !v.includes("/")) setExp(v + "/");
                        else setExp(v);
                      }}
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/25"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/70">CVC</label>
                    <input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/25"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70">Держатель карты (необязательно)</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 40))}
                    placeholder="NAME SURNAME"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/25"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-medium">СБП</div>
                <div className="mt-2 text-sm text-white/70">
                  Здесь можно показать QR/список банков. Для теста просто нажми “Оплатить”.
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.back()}
                className="rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm text-white/80 hover:bg-white/5"
                disabled={loading}
              >
                Отменить
              </button>

              <button
                onClick={onPay}
                disabled={loading || !canPay}
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {loading ? "Проводим платёж..." : `Оплатить ${totalText} ₽`}
              </button>
            </div>
          </div>

          {/* RIGHT (sticky on desktop) */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="text-sm font-medium">Безопасность</div>
              <div className="mt-2 text-sm text-white/70">
                Данные передаются по защищённому соединению. В эмуляторе реквизиты используются только для теста.
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Итого</span>
                  <span className="text-white">{totalText} ₽</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Комиссия</span>
                  <span className="text-white">0 ₽</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between">
                  <span className="text-white/70">К оплате</span>
                  <span className="text-white font-semibold">{totalText} ₽</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
                Источник суммы: Payment.amount (из БД). Фронт не может подменить итог.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/40">
          tihiydom.com • mock checkout
        </div>
      </div>
    </div>
  );
}
