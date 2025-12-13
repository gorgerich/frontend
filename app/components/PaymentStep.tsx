"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { CheckCircle2, Download, Share2, RubleSign } from "./Icons";

export type PaymentMethod = "card" | "sbp" | "installment";

export type CardData = {
  number: string;
  expiry: string;
  cvc: string;
  holder: string;
};

type PaymentStepProps = {
  total: number;

  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;

  cardData: CardData;
  setCardData: React.Dispatch<React.SetStateAction<CardData>>;

  email: string;
  setEmail: (v: string) => void;

  customerName?: string;

  // обработчик из StepperWorkflow (POST /api/orders)
  onConfirm?: () => Promise<void> | void;
};

export function PaymentStep({
  total,
  paymentMethod,
  setPaymentMethod,
  cardData,
  setCardData,
  email,
  setEmail,
  onConfirm,
}: PaymentStepProps) {
  const canSubmit = Boolean(email && email.includes("@"));

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-lg space-y-6">
        {/* Итоговая смета */}
        <div>
          <h4 className="mb-4">Итоговая смета</h4>

          <div className="flex justify-between pt-2">
            <span className="text-lg">Итого:</span>
            <span className="text-2xl">{total.toLocaleString("ru-RU")} ₽</span>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
              type="button"
            >
              <Download className="h-4 w-4 mr-2" />
              Договор
            </Button>

            <Button
              variant="outline"
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
              type="button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>

        <div className="border-t border-white/20" />

        {/* Способ оплаты */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <RubleSign className="h-6 w-6 text-white" />
            <h4 className="text-lg text-white">Способ оплаты</h4>
          </div>

          {paymentMethod !== "card" && (
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className="w-full p-4 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-left mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center" />
                <span className="text-sm text-white">Банковская карта</span>
              </div>
              <p className="text-xs text-white/70 ml-7">Visa, Mastercard, МИР</p>
            </button>
          )}

          {paymentMethod === "card" && (
            <div className="mt-4">
              <div className="grid gap-6 md:grid-cols-2 items-start">
                {/* Карта */}
                <div className="relative mx-auto w-full max-w-md">
                  <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl bg-white border border-gray-200">
                    <div className="absolute top-6 left-6 w-12 h-10 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 backdrop-blur" />

                    <div className="absolute top-6 right-6 flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur border border-white/60" />
                      <div className="w-8 h-8 rounded-full bg-white/60 backdrop-blur border border-white/60 -ml-4" />
                    </div>

                    <div className="absolute top-16 left-6 right-6">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none text-gray-900 text-xl tracking-[0.2em] placeholder:text-gray-500 focus:outline-none font-mono"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\s/g, "")
                            .replace(/(\d{4})/g, "$1 ")
                            .trim()
                            .slice(0, 19);
                          setCardData((prev) => ({ ...prev, number: value }));
                        }}
                        maxLength={19}
                      />
                    </div>

                    <div className="absolute bottom-10 left-6 right-6 flex justify-between items-end">
                      <div className="flex-1 min-w-0 mr-4">
                        <input
                          type="text"
                          className="w-full bg-transparent border-none text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none uppercase"
                          placeholder="IVAN IVANOV"
                          value={cardData.holder}
                          onChange={(e) => {
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z\s]/g, "")
                              .slice(0, 26);
                            setCardData((prev) => ({ ...prev, holder: value }));
                          }}
                        />
                        <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">
                          Держатель карты
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <input
                          type="text"
                          className="w-16 bg-transparent border-none text-gray-900 text-sm text-right placeholder:text-gray-500 focus:outline-none font-mono"
                          placeholder="MM/ГГ"
                          value={cardData.expiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2);
                            setCardData((prev) => ({ ...prev, expiry: value }));
                          }}
                          maxLength={5}
                        />
                        <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide text-right">
                          Действительна
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CVC + Email */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label htmlFor="cardCvc" className="text-gray-900 text-xs mb-2 block">
                          CVC/CVV код
                        </Label>
                        <Input
                          id="cardCvc"
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-center text-lg tracking-widest font-mono"
                          placeholder="•••"
                          type="password"
                          value={cardData.cvc}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                            setCardData((prev) => ({ ...prev, cvc: value }));
                          }}
                          maxLength={3}
                        />
                      </div>
                      <div className="text-xs text-gray-600 max-w-[120px]">
                        3 цифры на обратной стороне карты
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Label htmlFor="userEmail" className="text-gray-900 text-sm mb-2 block">
                      Email для получения информации
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      На этот адрес придет подтверждение заказа, детали церемонии и все необходимые документы.
                    </p>
                  </div>
                </div>
              </div>

              {/* Другие способы */}
              <div className="pt-4 border-t border-white/20 mt-6">
                <p className="text-xs text-white/60 mb-3">Или выберите другой способ:</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("sbp")}
                    className="p-4 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center" />
                      <span className="text-sm text-white">СБП</span>
                    </div>
                    <p className="text-xs text-white/70 ml-7">Система быстрых платежей</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("installment")}
                    className="p-4 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center" />
                      <span className="text-sm text-white">Рассрочка</span>
                    </div>
                    <p className="text-xs text-white/70 ml-7">0% на 6 месяцев</p>
                  </button>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-white">Защищённый платёж</p>
                    <p className="text-xs text-white/70">
                      Данные передаются по защищённому протоколу и не хранятся на наших серверах.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg bg-white text-gray-900 hover:bg-gray-100 mt-6"
                type="button"
                disabled={!canSubmit}
                onClick={() => void onConfirm?.()}
              >
                Подтвердить и забронировать
              </Button>
            </div>
          )}

          {/* Если выбрали не "card" — тут можно потом добавить UI под СБП/рассрочку */}
          {paymentMethod !== "card" && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <p className="text-sm text-white">
                Способ оплаты выбран:{" "}
                <Badge variant="secondary" className="ml-2">
                  {paymentMethod === "sbp" ? "СБП" : "Рассрочка"}
                </Badge>
              </p>

              <Button
                className="w-full h-14 text-lg bg-white text-gray-900 hover:bg-gray-100 mt-4"
                type="button"
                disabled={!canSubmit}
                onClick={() => void onConfirm?.()}
              >
                Подтвердить и забронировать
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}