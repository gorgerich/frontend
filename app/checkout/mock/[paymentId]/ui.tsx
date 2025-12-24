"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentDTO = {
  providerPaymentId: string;
  orderId: string;
  amount: number; // копейки
  currency: string;
  status: string;
  method: "card" | "sbp";
};

type PayMode = "full" | "deposit" | "split";

function rub(kopeks: number) {
  return Math.round(kopeks / 100).toLocaleString("ru-RU");
}

export default function MockCheckoutUI({
  payment,
}: {
  payment: PaymentDTO;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<PayMode>("full");
  const [loading, setLoading] = useState(false);

  const total = payment.amount;
  const deposit = Math.round(total * 0.05);
  const splitPart = Math.round(total / 4);

  const payable = useMemo(() => {
    if (mode === "deposit") return deposit;
    if (mode === "split") return splitPart;
    return total;
  }, [mode, total, deposit, splitPart]);

  function onPay() {
    setLoading(true);
    setTimeout(() => {
      alert("Оплата прошла успешно");
      router.push("/");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-gray-900">
          Оплата заказа
        </h1>

        <div className="mt-2 text-sm text-gray-500">
          Заказ #{payment.orderId}
        </div>

        {/* ВЫБОР СПОСОБА */}
        <div className="mt-6 space-y-3">
          <PayOption
            active={mode === "full"}
            title={`Оплатить полностью — ${rub(total)} ₽`}
            onClick={() => setMode("full")}
          />
          <PayOption
            active={mode === "deposit"}
            title={`Депозит 5% — ${rub(deposit)} ₽`}
            subtitle="Оставшаяся сумма — позже"
            onClick={() => setMode("deposit")}
          />
          <PayOption
            active={mode === "split"}
            title={`Сплит — ${rub(splitPart)} ₽ × 4`}
            subtitle="Без переплат"
            onClick={() => setMode("split")}
          />
        </div>

        {/* КАРТА */}
        <div className="mt-6 space-y-4">
          <Input placeholder="Номер карты" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="MM / YY" />
            <Input placeholder="CVC" />
          </div>
        </div>

        {/* ИТОГО */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-gray-500">К оплате</span>
          <span className="text-lg font-semibold text-gray-900">
            {rub(payable)} ₽
          </span>
        </div>

        <button
          disabled={loading}
          onClick={onPay}
          className="mt-6 w-full rounded-xl bg-black py-3 text-white font-medium disabled:opacity-50"
        >
          {loading ? "Обработка..." : "Оплатить"}
        </button>
      </div>
    </div>
  );
}

function PayOption({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left ${
        active
          ? "border-black bg-black text-white"
          : "border-gray-200 bg-white text-gray-900"
      }`}
    >
      <div className="font-medium">{title}</div>
      {subtitle && (
        <div className="text-sm opacity-80">{subtitle}</div>
      )}
    </button>
  );
}

function Input({ placeholder }: { placeholder: string }) {
  return (
    <input
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
    />
  );
}
