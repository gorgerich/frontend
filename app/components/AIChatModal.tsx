import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Check } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'tariffs' | 'tariff-details' | 'tariff-selected';
  tariffData?: {
    name: string;
    price: number;
    description: string;
    services: string[];
  };
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

const tariffs = [
  {
    name: "Стандарт",
    price: 100000,
    description: "Базовый комплект услуг для достойного прощания",
    services: [
      "Гроб стандартный",
      "Венок и цветы",
      "Транспортировка",
      "Место на кладбище (стандарт)",
      "Оформление документов",
      "Ритуальные принадлежности"
    ]
  },
  {
    name: "Комфорт",
    price: 200000,
    description: "Расширенный набор услуг с улучшенной атрибутикой",
    services: [
      "Гроб улучшенный",
      "Венки и цветочные композиции",
      "Транспортировка (класс комфорт)",
      "Место на кладбище (комфорт)",
      "Оформление документов",
      "Ритуальные принадлежности расширенные",
      "Поминальный обед (базовый)",
      "Памятная табличка"
    ]
  },
  {
    name: "Премиум",
    price: 300000,
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
      "Организация церемонии"
    ]
  }
];

export function AIChatModal({ isOpen, onClose, onOpenStepper }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastClickedActionId, setLastClickedActionId] = useState<number | null>(null);
  const [selectedTariffName, setSelectedTariffName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSequenceRef = useRef(0);
  const nextMessageId = useCallback(() => {
    messageSequenceRef.current += 1;
    return `message-${messageSequenceRef.current}`;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Приветственное сообщение при открытии
      const timeout = window.setTimeout(() => {
        const welcomeMessage: Message = {
          id: nextMessageId(),
          text: "Здравствуйте! Я ваш AI-помощник по организации прощания. Готов помочь вам подобрать оптимальный вариант и ответить на все вопросы. Выберите один из быстрых вариантов ниже или напишите свой вопрос.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }, 500);
      return () => window.clearTimeout(timeout);
    }
  }, [isOpen, messages.length, nextMessageId]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('тариф') || lowerMessage.includes('готовый')) {
      return "Отлично! У нас есть три готовых тарифа: Стандарт (100 000₽), Комфорт (200 000₽) и Премиум (300 000₽). Каждый включает все необходимое для достойного прощания. Рекомендую начать с шага 'Формат' в мастере настройки выше.";
    }

    if (lowerMessage.includes('собрать') || lowerMessage.includes('самостоятельно')) {
      return "Конечно! Вы можете собрать индивидуальную комплектацию, выбирая только нужные услуги. Начните с выбора формата (захоронение или кремация), затем места, атрибутики и дополнительных услуг. Итоговая стоимость отображается в калькуляторе справа внизу.";
    }

    if (lowerMessage.includes('стоимость') || lowerMessage.includes('цена')) {
      return "Стоимость зависит от выбранного формата и комплектации. Базовые тарифы начинаются от 100 000₽. Вы можете использовать наш калькулятор для точного расчета, добавляя только необходимые услуги.";
    }

    if (lowerMessage.includes('документ')) {
      return "Для организации прощания потребуются: свидетельство о смерти, паспорт усопшего, ваш паспорт (как заказчика). Я помогу вам пройти через все этапы оформления на шаге 'Документы' в мастере.";
    }

    if (lowerMessage.includes('формат') || lowerMessage.includes('выбор')) {
      return "Основные форматы: захоронение (традиционное погребение на кладбище) и кремация (с последующим размещением урны в колумбарии или выдачей родственникам). Выбор зависит от ваших личных предпочтений, культурных традиций и бюджета.";
    }

    return "Спасибо за ваш вопрос. Для более детальной консультации рекомендую воспользоваться пошаговым мастером выше или выбрать один из быстрых вариантов. Я здесь, чтобы помочь вам на каждом этапе.";
  };

  const handleQuickAction = (actionText: string, actionId: number) => {
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: nextMessageId(),
      text: actionText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Специальная обработка для "Выбрать готовый тариф"
    if (actionText === "Выбрать готовый тариф") {
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: nextMessageId(),
          text: "Отлично! Вот наши готовые тарифы. Выберите подходящий вариант:",
          isUser: false,
          timestamp: new Date(),
          type: 'tariffs',
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    // Имитация печатания AI для остальных действий
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: nextMessageId(),
        text: simulateAIResponse(actionText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);

    // Запоминаем ID последнего нажатого действия
    setLastClickedActionId(actionId);
  };

  const handleTariffSelection = (tariff: typeof tariffs[0]) => {
    // Сообщение пользователя о выборе
    const userMessage: Message = {
      id: nextMessageId(),
      text: `Показать детали тарифа "${tariff.name}"`,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Ответ AI с деталями тарифа
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: nextMessageId(),
        text: `Вот подробная информация о тарифе "${tariff.name}":`,
        isUser: false,
        timestamp: new Date(),
        type: 'tariff-details',
        tariffData: tariff,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSelectTariff = (tariffName: string) => {
    const userMessage: Message = {
      id: nextMessageId(),
      text: `Выбрать тариф "${tariffName}"`,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: nextMessageId(),
        text: `Отлично! Тариф "${tariffName}" выбран. Теперь вы можете перейти к настройке деталей в пошаговом мастере выше или задать мне дополнительные вопросы.`,
        isUser: false,
        timestamp: new Date(),
        type: 'tariff-selected',
        tariffData: {
            name: tariffName,
            price: 0,
            description: '',
            services: []
        }
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      // Сохраняем выбранный тариф, но не открываем stepper сразу
      setSelectedTariffName(tariffName);
    }, 1000);
  };

  const handleBackToTariffs = () => {
    const userMessage: Message = {
      id: nextMessageId(),
      text: "Вернуться к выбору тарифов",
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: nextMessageId(),
        text: "Конечно! Вот наши готовые тарифы. Выберите подходящий вариант:",
        isUser: false,
        timestamp: new Date(),
        type: 'tariffs',
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: nextMessageId(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Имитация печатания AI
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: nextMessageId(),
        text: simulateAIResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Полноэкранное окно чата - Minimalist Style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        data-td-topbuttons-overlay-content="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-chat-title"
        className="fixed inset-0 z-[9999] bg-[#f8f8f7] flex flex-col overflow-hidden"
      >
        {/* Заголовок с кнопкой закрытия */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-zinc-100 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zinc-900" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            </div>
            <div>
              <h2 id="ai-chat-title" className="text-xl font-medium text-zinc-900 tracking-tight">AI-Помощник</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-base text-zinc-600 font-medium">Онлайн консультант</p>
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            aria-label="Закрыть чат"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-transparent hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8f8f7] relative min-h-0 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {/* Фоновые декоративные элементы - Subtle or Removed */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-zinc-100 blur-[120px] rounded-full mix-blend-multiply" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-50 blur-[120px] rounded-full mix-blend-multiply" />
          </div>

          <div className="relative max-w-4xl mx-auto space-y-8 w-full z-10">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {message.isUser ? (
                  <div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tr-sm px-6 py-4 bg-zinc-900 text-white shadow-sm">
                    <p className="text-base leading-relaxed font-normal tracking-wide">{message.text}</p>
                  </div>
                ) : (
                  <div className="max-w-[90%] space-y-4 w-full">
                    <div className="rounded-2xl rounded-tl-sm px-6 py-5 bg-white border border-zinc-100 shadow-sm text-zinc-800">
                      <p className="text-base leading-relaxed font-normal tracking-wide">{message.text}</p>
                      
                      {/* Кнопка "Перейти" для выбранного тарифа */}
                      {message.type === 'tariff-selected' && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            if (selectedTariffName) {
                              onOpenStepper?.(selectedTariffName);
                            }
                            onClose();
                          }}
                          className="mt-5 w-full py-3.5 rounded-xl bg-zinc-900 text-white font-medium text-sm tracking-wide hover:bg-zinc-800 transition-all duration-200 shadow-lg shadow-zinc-200/50"
                        >
                          Перейти к настройке
                        </motion.button>
                      )}
                    </div>

                    {/* Карточки тарифов */}
                    {message.type === 'tariffs' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tariffs.map((tariff) => (
                          <motion.button
                            key={tariff.name}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTariffSelection(tariff)}
                            className="group relative p-6 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-300 text-left overflow-hidden shadow-sm hover:shadow-md"
                          >
                            <h3 className="relative text-lg font-medium text-zinc-900 mb-1">{tariff.name}</h3>
                            <p className="relative text-xl font-semibold text-zinc-900 mb-3">{tariff.price.toLocaleString('ru-RU')} ₽</p>
                            <p className="relative text-sm text-zinc-600 font-normal leading-relaxed">{tariff.description}</p>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Детали тарифа */}
                    {message.type === 'tariff-details' && message.tariffData && (
                      <div className="p-6 md:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-zinc-100 pb-6">
                          <h3 className="text-2xl text-zinc-900 font-semibold">{message.tariffData.name}</h3>
                          <div className="px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-100">
                            <p className="text-xl text-zinc-900 font-semibold">{message.tariffData.price.toLocaleString('ru-RU')} ₽</p>
                          </div>
                        </div>
                        <p className="text-base text-zinc-700 font-normal mb-6 leading-relaxed">{message.tariffData.description}</p>
                        <div className="mb-8">
                          <h4 className="text-sm text-zinc-400 font-medium uppercase tracking-widest mb-4">Что входит в тариф</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {message.tariffData.services.map((service, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100/50">
                                <Check className="w-4 h-4 text-zinc-900 flex-shrink-0 mt-1" />
                                <span className="text-base text-zinc-700 font-normal">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBackToTariffs}
                            className="flex-1 py-3.5 rounded-xl bg-white text-zinc-900 font-medium border border-zinc-200 hover:bg-zinc-50 transition-all duration-200"
                          >
                            Назад
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectTariff(message.tariffData!.name)}
                            className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-medium shadow-lg shadow-zinc-200 hover:shadow-xl hover:bg-zinc-800 transition-all duration-200"
                          >
                            Выбрать тариф
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Тариф выбран */}
                    {message.type === 'tariff-selected' && (
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-200">
                            <Check className="w-4 h-4 text-zinc-900" />
                          </div>
                          <p className="text-base text-zinc-700 font-normal">Тариф успешно выбран!</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Индикатор печатания */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-zinc-50 border border-zinc-100">
                  <div className="flex gap-1.5">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Поле ввода */}
        <div className="flex-shrink-0 p-4 md:p-6 border-t border-zinc-100 bg-white/80 backdrop-blur-md relative z-20">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4 focus-within:bg-white focus-within:border-zinc-300 transition-all duration-200 shadow-sm">
              {/* Быстрые действия внутри поля ввода */}
              <div className="mb-3 pb-3 border-b border-zinc-100">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 -mx-1 px-1">
                  {quickActions.filter(action => action.id !== lastClickedActionId).map((action) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAction(action.text, action.id)}
                      className="px-3 py-2 bg-white border border-zinc-200 rounded-full text-zinc-700 text-sm hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-all duration-200 flex-shrink-0 snap-start whitespace-nowrap shadow-sm"
                    >
                      {action.text}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Поле ввода и кнопка отправки */}
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите ваш вопрос..."
                  className="flex-1 bg-transparent text-zinc-900 placeholder-zinc-500 focus:outline-none text-base font-normal tracking-wide"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 flex-shrink-0"
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
