"use client";

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Check } from "lucide-react";

type Tariff = {
  name: string;
  price: number;
  description: string;
  services: string[];
};

type MessageType = "text" | "tariffs" | "tariff-details" | "tariff-selected";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: MessageType;
  tariffData?: Tariff;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStepper?: (tariffName: string) => void;
}

const quickActions = [
  { id: 1, text: "Выбрать готовый тариф", emoji: "📦" },
  { id: 2, text: "Собрать тариф самостоятельно", emoji: "🔧" },
  { id: 3, text: "Узнать стоимость услуг", emoji: "💰" },
  { id: 4, text: "Помощь с выбором формата", emoji: "🤔" },
  { id: 5, text: "Консультация по документам", emoji: "📄" },
];

const tariffs: Tariff[] = [
  {
    name: "Стандарт",
    price: 100_000,
    description: "Базовый комплект услуг для достойного прощания",
    services: [
      "Гроб стандартный",
      "Венок и цветы",
      "Транспортировка",
      "Место на кладбище (стандарт)",
      "Оформление документов",
      "Ритуальные принадлежности",
    ],
  },
  {
    name: "Комфорт",
    price: 200_000,
    description: "Расширенный набор услуг с улучшенной атрибутикой",
    services: [
      "Гроб улучшенный",
      "Венки и цветочные композиции",
      "Транспортировка (класс комфорт)",
      "Место на кладбище (комфорт)",
      "Оформление документов",
      "Ритуальные принадлежности расширенные",
      "Поминальный обед (базовый)",
      "Памятная табличка",
    ],
  },
  {
    name: "Премиум",
    price: 300_000,
    description: "Полный премиальный комплекс услуг",
    services: [
      "Гроб премиум класса",
      "Эксклюзивные цветочные композиции",
      "Транспортировка VIP",
      "Место на кладбище (премиум)",
      "Полное оформление документов",
      "Ритуальные принадлежности премиум",
      "Поминальный обед (расширенный)",
      "Памятный монумент",
      "Фото и видео съемка",
      "Организация церемонии",
    ],
  },
];

export function AIChatModal({ isOpen, onClose, onOpenStepper }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastClickedActionId, setLastClickedActionId] = useState<number | null>(
    null
  );
  const [selectedTariffName, setSelectedTariffName] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "Здравствуйте! Я ваш AI-помощник по организации прощания. Готов помочь вам подобрать оптимальный вариант и ответить на все вопросы. Выберите один из быстрых вариантов ниже или напишите свой вопрос.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }, 500);
    }
  }, [isOpen, messages.length]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("тариф") || lowerMessage.includes("готовый")) {
      return "Отлично! У нас есть три готовых тарифа: Стандарт (100 000₽), Комфорт (200 000₽) и Премиум (300 000₽). Каждый включает все необходимое для достойного прощания. Рекомендую начать с шага «Формат» в мастере настройки выше.";
    }

    if (lowerMessage.includes("собрать") || lowerMessage.includes("самостоятельно")) {
      return "Конечно! Вы можете собрать индивидуальную комплектацию, выбирая только нужные услуги. Начните с выбора формата (захоронение или кремация), затем места, атрибутики и дополнительных услуг. Итоговая стоимость отображается в калькуляторе справа внизу.";
    }

    if (lowerMessage.includes("стоимость") || lowerMessage.includes("цена")) {
      return "Стоимость зависит от выбранного формата и комплектации. Базовые тарифы начинаются от 100 000₽. Вы можете использовать наш калькулятор для точного расчета, добавляя только необходимые услуги.";
    }

    if (lowerMessage.includes("документ")) {
      return "Для организации прощания потребуются: свидетельство о смерти, паспорт усопшего, ваш паспорт (как заказчика). Я помогу вам пройти через все этапы оформления на шаге «Документы» в мастере.";
    }

    if (lowerMessage.includes("формат") || lowerMessage.includes("выбор")) {
      return "Основные форматы: захоронение (традиционное погребение на кладбище) и кремация (с последующим размещением урны в колумбарии или выдачей родственникам). Выбор зависит от ваших личных предпочтений, культурных традиций и бюджета.";
    }

    return "Спасибо за ваш вопрос. Для более детальной консультации рекомендую воспользоваться пошаговым мастером выше или выбрать один из быстрых вариантов. Я здесь, чтобы помочь вам на каждом этапе.";
  };

  const handleQuickAction = (actionText: string, actionId: number) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: actionText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (actionText === "Выбрать готовый тариф") {
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Отлично! Вот наши готовые тарифы. Выберите подходящий вариант:",
          isUser: false,
          timestamp: new Date(),
          type: "tariffs",
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
      setLastClickedActionId(actionId);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateAIResponse(actionText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);

    setLastClickedActionId(actionId);
  };

  const handleTariffSelection = (tariff: Tariff) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Показать детали тарифа "${tariff.name}"`,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Вот подробная информация о тарифе "${tariff.name}":`,
        isUser: false,
        timestamp: new Date(),
        type: "tariff-details",
        tariffData: tariff,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSelectTariff = (tariffName: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Выбрать тариф "${tariffName}"`,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Отлично! Тариф "${tariffName}" выбран. Теперь вы можете перейти к настройке деталей в пошаговом мастере выше или задать мне дополнительные вопросы.`,
        isUser: false,
        timestamp: new Date(),
        type: "tariff-selected",
        tariffData: {
          name: tariffName,
          price: 0,
          description: "",
          services: [],
        },
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      setSelectedTariffName(tariffName);
    }, 1000);
  };

  const handleBackToTariffs = () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: "Вернуться к выбору тарифов",
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Конечно! Вот наши готовые тарифы. Выберите подходящий вариант:",
        isUser: false,
        timestamp: new Date(),
        type: "tariffs",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateAIResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col overflow-hidden"
      >
        {/* header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white tracking-wide">
                AI-Помощник
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-sm text-blue-200/60 font-light">
                  Онлайн консультант
                </p>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 relative min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
          </div>

          <div className="relative max-w-4xl mx-auto space-y-6 w-full z-10">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                {message.isUser ? (
                  <div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tr-sm px-5 py-4 bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                    <p className="text-sm md:text-base leading-relaxed font-light tracking-wide">
                      {message.text}
                    </p>
                  </div>
                ) : (
                  <div className="max-w-[90%] space-y-3 w-full">
                    <div className="rounded-2xl rounded-tl-sm px-6 py-5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl text-blue-50">
                      <p className="text-sm md:text-base leading-relaxed font-light tracking-wide opacity-90">
                        {message.text}
                      </p>

                      {message.type === "tariff-selected" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (selectedTariffName) {
                              onOpenStepper?.(selectedTariffName);
                            }
                            onClose();
                          }}
                          className="mt-4 w-full py-3 rounded-xl bg-white text-slate-900 font-medium text-sm tracking-wide hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-white/5"
                        >
                          Перейти к настройке
                        </motion.button>
                      )}
                    </div>

                    {message.type === "tariffs" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tariffs.map((tariff) => (
                          <motion.button
                            key={tariff.name}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTariffSelection(tariff)}
                            className="group relative p-5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 text-left overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="relative text-lg font-medium text-white mb-1">
                              {tariff.name}
                            </h3>
                            <p className="relative text-xl font-light text-blue-200 mb-3">
                              {tariff.price.toLocaleString("ru-RU")} ₽
                            </p>
                            <p className="relative text-xs text-white/50 font-light leading-relaxed">
                              {tariff.description}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {message.type === "tariff-details" && message.tariffData && (
                      <div className="p-6 md:p-8 rounded-3xl bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-white/5 pb-6">
                          <h3 className="text-2xl text-white font-light">
                            {message.tariffData.name}
                          </h3>
                          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <p className="text-xl text-blue-200 font-light">
                              {message.tariffData.price.toLocaleString("ru-RU")} ₽
                            </p>
                          </div>
                        </div>
                        <p className="text-base text-white/70 font-light mb-6 leading-relaxed">
                          {message.tariffData.description}
                        </p>
                        <div className="mb-8">
                          <h4 className="text-sm text-blue-200/80 font-medium uppercase tracking-widest mb-4">
                            Что входит в тариф
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {message.tariffData.services.map((service, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                              >
                                <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                                <span className="text-sm text-white/80 font-light">
                                  {service}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBackToTariffs}
                            className="flex-1 py-3.5 rounded-xl bg-white/5 text-white/80 font-medium border border-white/10 hover:bg-white/10 transition-all duration-200"
                          >
                            Назад
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleSelectTariff(message.tariffData!.name)
                            }
                            className="flex-1 py-3.5 rounded-xl bg-white text-slate-900 font-medium shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all duration-200"
                          >
                            Выбрать тариф
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {message.type === "tariff-selected" && (
                      <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                          <p className="text-sm text-green-100 font-light">
                            Тариф успешно выбран!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg.white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex gap-1.5">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-blue-200 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-blue-200 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-blue-200 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* input */}
        <div className="flex-shrink-0 p-4 md:p-6 border-t border-white/10 bg-slate-900/50 backdrop-blur-md relative z-20">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 focus-within:bg-white/10 focus-within:border-white/20 transition-all duration-200 shadow-xl">
              <div className="mb-3 pb-3 border-b border-white/5">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 -mx-1 px-1">
                  {quickActions
                    .filter((action) => action.id !== lastClickedActionId)
                    .map((action) => (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleQuickAction(action.text, action.id)
                        }
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-blue-100/80 text-xs hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex-shrink-0 snap-start whitespace-nowrap backdrop-blur-sm"
                      >
                        {action.text}
                      </motion.button>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Напишите ваш вопрос..."
                  className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm md:text-base font-light tracking-wide"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AIChatModal;