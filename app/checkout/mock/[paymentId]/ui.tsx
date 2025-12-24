"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PayPlan = "full" | "deposit" | "split";

type PaymentDTO = {
  providerPaymentId: string;
  orderId: string;      // publicId
  amount: number;       // копейки (к оплате сейчас, если сервер уже посчитал)
  currency: string;
  status: string;
  method: "card" | "sbp";
  // опционально, если будешь прокидывать план из БД:
  payPlan?: PayPlan;
  meta?: any;
};

function formatRub(amountKopeks: number) {
  const rub = amountKopeks / 100;
  return rub.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

function maskCardInput(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  const parts = digits.match(/.{1,4}/g) ?? [];
  return parts.join(" ");
}

function onlyDigits(v: string, max: number) {
  return v.replace(/\D/g, "").slice(0, max);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatDateRu(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Делим сумму на N частей так, чтобы сумма частей строго равнялась total (в копейках)
function splitAmount(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  const arr = Array(parts).fill(base) as number[];
  for (let i = 0; i < remainder; i++) arr[i] += 1; // распределяем по 1 копейке в первые платежи
  return arr;
}

export default function MockCheckoutUI({ payment }: { payment: PaymentDTO }) {
  const router = useRouter();

  // Эти режимы — для UI. В идеале сервер создаёт Payment уже с нужной amount (к оплате сейчас).
  // Но если хочешь переключать режим прямо на странице — считаем локально от baseTotal.
  // Для этого нужен baseTotal (полная сумма заказа). Сейчас у тебя в payment.amount может быть уже “к оплате сейчас”.
  // Я оставляю “baseTotal = payment.meta?.orderTotal ?? payment.amount” — лучше прокинуть orderTotal в meta.
  const baseTotal = useMemo(() => {
    const fromMeta = payment?.meta?.orderTotal;
    return typeof fromMeta === "number" ? fromMeta : payment.amount;
  }, [payment]);

  const [payPlan, setPayPlan] = useState<PayPlan>(payment.payPlan ?? "full");
  const depositPercent = 5;
  const splitPartsCount = 4;

  const amountNow = useMemo(() => {
    if (payPlan === "full") return baseTotal;
    if (payPlan === "deposit") return Math.max(1, Math.round(baseTotal * (depositPercent / 100)));
    // split
    const parts = splitAmount(baseTotal, splitPartsCount);
    return parts[0];
  }, [payPlan, baseTotal]);

  const splitSchedule = useMemo(() => {
    if (payPlan !== "split") return [];
    const parts = splitAmount(baseTotal, splitPartsCount);
    const start = new Date();
    // UX: 0, 14, 28, 42 дней
    return parts.map((amt, idx) => ({
      date: formatDateRu(addDays(start, idx * 14)),
      amount: amt,
    }));
  }, [payPlan, baseTotal]);

  const totalText = useMemo(() => formatRub(amountNow), [amountNow]);

  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const isCardOk = useMemo(() => onlyDigits(card, 16).length >= 12, [card]);
  const isExpOk = useMemo(() => /^\d{2}\/\d{2}$/.test(exp), [exp]);
  const isCvcOk = useMemo(() => /^\d{3,4}$/.test(cvc), [cvc]);

  const canPay = payment.method === "card" ? isCardOk && isExpOk && isCvcOk : true;

  async function onPay() {
    setLoading(true);

    // Здесь можно дернуть API, который:
    // 1) обновит Payment.status -> succeeded
    // 2) сохранит payPlan/график в webhookRaw/createRaw и т.п.
    // Пока оставим UX-оплату.
    setTimeout(() => {
      setLoading(false);
      router.push("/"); // можно заменить на /success
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-[980px] px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm text-white/60">Оплата</div>
              <div className="mt-1 text-2xl font-semibold">Банковской картой</div>
              <div className="mt-2 text-sm text-white/60">
                Заказ #{payment.orderId}
              </div>
            </div>

            <div className="mt-3 sm:mt-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <div className="text-xs text-white/60">К оплате сейчас</div>
              <div className="mt-1 text-xl font-semibold">{totalText} ₽</div>
            </div>
          </div>

          {/* Выбор варианта оплаты */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-medium">Вариант оплаты</div>

            <div className="mt-3 grid gap-2">
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="payplan"
                  checked={payPlan === "full"}
                  onChange={() => setPayPlan("full")}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Оплатить всю сумму</div>
                  <div className="text-xs text-white/60">Полная оплата заказа</div>
                </div>
                <div className="text-sm font-semibold">{formatRub(baseTotal)} ₽</div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="payplan"
                  checked={payPlan === "deposit"}
                  onChange={() => setPayPlan("deposit")}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Оплатить депозит</div>
                  <div className="text-xs text-white/60">Депозит {depositPercent}% от суммы заказа</div>
                </div>
                <div className="text-sm font-semibold">{formatRub(Math.round(baseTotal * (depositPercent / 100)))} ₽</div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="payplan"
                  checked={payPlan === "split"}
                  onChange={() => setPayPlan("split")}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Оплатить частями</div>
                  <div className="text-xs text-white/60">Оплата в {splitPartsCount} платежа по графику</div>
                </div>
                <div className="text-sm font-semibold">{formatRub(splitAmount(baseTotal, splitPartsCount)[0])} ₽</div>
              </label>
            </div>

            {payPlan === "split" && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="text-sm font-medium">График платежей</div>
                <div className="mt-2 space-y-2 text-sm text-white/70">
                  {splitSchedule.map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{idx === 0 ? "Сегодня" : p.date}</span>
                      <span className="text-white">{formatRub(p.amount)} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Инпуты карты */}
          {payment.method === "card" ? (
            <div className="mt-6 grid gap-4">
              <div>
                <label className="text-sm text-white/70">Номер карты</label>
                <input
                  value={card}
                  onChange={(e) => setCard(maskCardInput(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/25"
                  inputMode="numeric"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70">Срок действия</label>
                  <input
                    value={exp}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d/]/g, "").slice(0, 5);
                      if (raw.length === 2 && !raw.includes("/")) setExp(raw + "/");
                      else setExp(raw);
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
                    onChange={(e) => setCvc(onlyDigits(e.target.value, 4))}
                    placeholder="000"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/25"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Держатель карты</label>
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
                Подтвердите оплату в приложении банка после нажатия “Оплатить”.
              </div>
            </div>
          )}

          {/* Детали платежа */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-medium">Детали платежа</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div className="flex justify-between">
                <span>Сумма заказа</span>
                <span className="text-white">{formatRub(baseTotal)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>К оплате сейчас</span>
                <span className="text-white">{formatRub(amountNow)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Вариант</span>
                <span className="text-white">
                  {payPlan === "full" ? "Полная оплата" : payPlan === "deposit" ? "Депозит" : "Оплата частями"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Статус</span>
                <span className="text-white">{payment.status}</span>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => router.back()}
              className="rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm text-white/80 hover:bg-white/5"
              disabled={loading}
            >
              Назад
            </button>

            <button
              onClick={onPay}
              disabled={loading || !canPay}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Обработка..." : `Оплатить ${totalText} ₽`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
