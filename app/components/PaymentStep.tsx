"use client";

import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "./ui/utils";
import { Download, Share2, RubleSign, CheckCircle2, Search } from "./Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type PaymentMethod = "card" | "sbp" | "installment";

export type CardData = {
  number: string;
  holder: string;
  expiry: string;
  cvc: string;
};

export type PaymentStepProps = {
  total: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
  cardData: CardData;
  setCardData: React.Dispatch<React.SetStateAction<CardData>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  onConfirm: () => Promise<void>;
};

export default function PaymentStep({
  total,
  paymentMethod,
  setPaymentMethod,
  cardData,
  setCardData,
  email,
  setEmail,
  onConfirm,
}: PaymentStepProps) {
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthly = useMemo(() => Math.ceil(total / 6), [total]);

  const openOffer = () => window.open("/docs/offer.pdf", "_blank");

  const shareOffer = async () => {
    const url = `${window.location.origin}/docs/offer.pdf`;
    try {
      // @ts-ignore
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title: "Договор-оферта", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      alert("Ссылка на договор скопирована");
    } catch {
      // молча
    }
  };

  const emailOk =
    email.trim().length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const canConfirm = offerAccepted && emailOk && !isSubmitting;

  const handleConfirmClick = async () => {
    if (!canConfirm) return;
    try {
      setIsSubmitting(true);
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const MethodButton = ({
    value,
    title,
    subtitle,
  }: {
    value: PaymentMethod;
    title: string;
    subtitle: string;
  }) => (
    <button
      type="button"
      onClick={() => setPaymentMethod(value)}
      disabled={isSubmitting}
      className={cn(
        "p-4 rounded-2xl border-2 transition-all duration-200 text-left bg-gray-800/50",
        paymentMethod === value
          ? "border-blue-500 bg-blue-500/20"
          : "border-white/30 hover:border-white/50",
        isSubmitting && "opacity-60 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            paymentMethod === value ? "border-blue-400" : "border-white/50",
          )}
        >
          {paymentMethod === value && (
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          )}
        </div>
        <span className="text-sm text-white">{title}</span>
      </div>
      <p className="text-xs text-white/70 ml-7">{subtitle}</p>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-lg space-y-6">
        {/* Итоговая смета */}
        <div>
          <h4 className="mb-4">Итоговая смета</h4>

          <div className="space-y-3">
            <div className="flex justify-between pt-2">
              <span className="text-lg">Итого:</span>
              <span className="text-2xl">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={openOffer}
              disabled={isSubmitting}
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Договор
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={shareOffer}
              disabled={isSubmitting}
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
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

          {paymentMethod === "card" ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* СЛЕВА: карта */}
                <div className="lg:col-span-2 min-w-0">
                  <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 shadow-2xl bg-white border border-gray-200 overflow-hidden">
                    <div className="absolute top-6 left-6 w-12 h-10 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 backdrop-blur" />
                    <div className="absolute top-6 right-6 flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur border border-white/60" />
                      <div className="w-8 h-8 rounded-full bg-white/60 backdrop-blur border border-white/60 -ml-4" />
                    </div>

                    <div className="absolute top-16 lg:top-auto lg:bottom-[88px] left-6 right-6">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none text-gray-900 text-xl tracking-[0.2em] placeholder:text-gray-500 focus:outline-none font-mono"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\s/g, "")
                            .replace(/(\d{4})/g, "$1 ")
                            .trim();
                          setCardData({ ...cardData, number: value });
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
                              .replace(/[^A-Z\s]/g, "");
                            setCardData({ ...cardData, holder: value });
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
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value =
                                value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            setCardData({ ...cardData, expiry: value });
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

                {/* СПРАВА: CVC + Email */}
                <div className="lg:col-span-1 space-y-4 min-w-0">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Label
                      htmlFor="cardCvc"
                      className="text-gray-900 text-sm mb-2 block"
                    >
                      CVC/CVV код
                    </Label>

                    {/* было: фиксированная ширина w-40 -> ломает сетку */}
                    <div className="flex gap-3 items-start min-w-0">
                      <Input
                        id="cardCvc"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-center text-lg tracking-widest font-mono"
                        placeholder="•••"
                        type="password"
                        value={cardData.cvc}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setCardData({ ...cardData, cvc: value });
                        }}
                        maxLength={3}
                      />
                      <p className="text-xs text-gray-500 pt-1 flex-1 min-w-0">
                        3 цифры на обратной стороне карты
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Label
                      htmlFor="userEmail"
                      className="text-gray-900 text-sm mb-2 block"
                    >
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
                      На этот адрес придёт подтверждение заказа, детали церемонии и
                      все необходимые документы.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/20 pt-4">
                <p className="text-xs text-white/60 mb-3">
                  Или выберите другой способ:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("sbp")}
                    disabled={isSubmitting}
                    className="p-4 rounded-2xl border-2 transition-all duration-200 text-left bg-gray-800/50 border-white/30 hover:border-white/50 disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-white/50" />
                      <span className="text-sm text-white">СБП</span>
                    </div>
                    <p className="text-xs text-white/70 ml-7">
                      Система быстрых платежей
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("installment")}
                    disabled={isSubmitting}
                    className="p-4 rounded-2xl border-2 transition-all duration-200 text-left bg-gray-800/50 border-white/30 hover:border-white/50 disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-white/50" />
                      <span className="text-sm text-white">Рассрочка</span>
                    </div>
                    <p className="text-xs text-white/70 ml-7">0% на 6 месяцев</p>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MethodButton
                  title="Банковская карта"
                  subtitle="Visa, Mastercard, МИР"
                  value="card"
                />
                <MethodButton
                  title="СБП"
                  subtitle="Система быстрых платежей"
                  value="sbp"
                />
                <MethodButton
                  title="Рассрочка"
                  subtitle="0% на 6 месяцев"
                  value="installment"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
                <Label
                  htmlFor="userEmail"
                  className="text-gray-900 text-sm mb-2 block"
                >
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
                  На этот адрес придёт подтверждение заказа, детали церемонии и
                  документы.
                </p>
              </div>

              {paymentMethod === "sbp" && (
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mt-4">
                  <Label className="text-sm text-white mb-2 block">
                    Выберите банк для оплаты через СБП
                  </Label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      placeholder="Поиск банка..."
                      className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Выберите ваш банк" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/20">
                      <SelectItem value="sberbank" className="text-white hover:bg-white/10">
                        Сбербанк
                      </SelectItem>
                      <SelectItem value="vtb" className="text-white hover:bg-white/10">
                        ВТБ
                      </SelectItem>
                      <SelectItem value="alpha" className="text-white hover:bg-white/10">
                        Альфа-Банк
                      </SelectItem>
                      <SelectItem value="tinkoff" className="text-white hover:bg-white/10">
                        Т-Банк
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/70 mt-3 text-center">
                    QR-код для оплаты появится после подтверждения
                  </p>
                </div>
              )}

              {paymentMethod === "installment" && (
                <div className="space-y-4 mt-4">
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white">Сумма к оплате</span>
                      <span className="text-lg text-white">
                        {total.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Ежемесячный платёж</span>
                      <span className="text-lg text-white">
                        {monthly.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                    <p className="text-sm text-white">
                      Рассрочка без процентов на 6 месяцев
                      <br />
                      Одобрение онлайн за 3 минуты
                      <br />
                      Первый платёж через 30 дней
                    </p>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      className="w-full mt-4 bg-white hover:bg-white/90 text-black"
                    >
                      Подать заявку
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="p-4 rounded-2xl border-2 border-green-500/30 bg-green-500/10 mt-6">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-white">Защищённый платёж</div>
                <div className="text-xs text-white/70">
                  Данные передаются по защищённому протоколу и не хранятся на
                  серверах.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-gray-900 text-white rounded-2xl p-4 border border-white/20 mt-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={offerAccepted}
              onChange={(e) => setOfferAccepted(e.target.checked)}
              disabled={isSubmitting}
            />
            <div className="text-sm text-white/80">
              Я ознакомился и принимаю условия{" "}
              <button
                type="button"
                onClick={openOffer}
                className="underline text-white"
                disabled={isSubmitting}
              >
                договора-оферты
              </button>
              .
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-14 text-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 mt-6"
            disabled={!canConfirm}
            onClick={handleConfirmClick}
          >
            {isSubmitting ? "Оформляем…" : "Подтвердить и забронировать"}
          </Button>

          {!email.trim() && (
            <p className="text-xs text-gray-300 text-center">
              Укажите email — туда отправим подтверждение и документы.
            </p>
          )}
          {!!email.trim() && !emailOk && (
            <p className="text-xs text-gray-300 text-center">
              Проверьте корректность email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}