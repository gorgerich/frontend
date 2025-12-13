"use client";

import React from "react";
import { RussianRuble, Download, Share2, CheckCircle2 } from "lucide-react";

type PaymentMethod = "card" | "sbp" | "installment";

type Props = {
  total: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
  cardData: { number: string; holder: string; expiry: string; cvc: string };
  setCardData: React.Dispatch<
    React.SetStateAction<{ number: string; holder: string; expiry: string; cvc: string }>
  >;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;

  formData?: any;
  onUpdateFormData?: (patch: any) => void;

  onConfirm: () => void;
};

function PaymentStep(props: Props) {
  const { total, paymentMethod, setPaymentMethod, cardData, setCardData, email, setEmail } = props;

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-lg space-y-6">
        <div>
          <h4 className="mb-4">Итоговая смета</h4>

          <div className="flex justify-between pt-2">
            <span className="text-lg">Итого:</span>
            <span className="text-2xl">{total.toLocaleString("ru-RU")} ₽</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" className="flex-1 bg-white text-gray-900 hover:bg-gray-100 rounded-xl p-3">
              <Download className="h-4 w-4 mr-2 inline" />
              Договор
            </button>

            <button type="button" className="flex-1 bg-white text-gray-900 hover:bg-gray-100 rounded-xl p-3">
              <Share2 className="h-4 w-4 mr-2 inline" />
              Поделиться
            </button>
          </div>
        </div>

        <div className="border-t border-white/20" />

        <div>
          <div className="flex items-center gap-3 mb-4">
            <RussianRuble className="h-6 w-6 text-white" />
            <h4 className="text-lg text-white">Способ оплаты</h4>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-gray-900 text-sm mb-2 block">Email для получения информации</label>
            <input
              type="email"
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-2"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              На этот адрес придет подтверждение заказа, детали церемонии и документы.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-white">Защищённый платёж</p>
                <p className="text-xs text-white/70">Данные передаются по защищённому протоколу и не хранятся на серверах.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="w-full h-14 text-lg bg-gray-900 text-white rounded-2xl hover:bg-gray-800"
        type="button"
        onClick={props.onConfirm}
      >
        Подтвердить и забронировать
      </button>
    </div>
  );
}

export default PaymentStep;