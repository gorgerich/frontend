import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp, Download, Share2 } from './Icons';
import { cn } from './ui/utils';

interface BreakdownItem {
  name: string;
  price?: number;
}

interface BreakdownSection {
  category: string;
  price: number;
  items?: BreakdownItem[];
}

interface FloatingCalculatorProps {
  total: number;
  breakdown: BreakdownSection[];
}

export function FloatingCalculator({ total, breakdown }: FloatingCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    console.log('Sharing...');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-300 ease-out">
      <Card className="bg-[#eef5f5]/80 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden rounded-[32px] ring-1 ring-white/50">
        <CardContent className={cn('relative z-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]', isExpanded ? 'p-6' : 'p-4')}>
          <div
            className={cn(
              'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
              !isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            )}
          >
            {/* Закрытое состояние */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 drop-shadow-sm">Итого</span>
                <span className="text-2xl font-light text-slate-800 tracking-tight tabular-nums drop-shadow-sm">
                  {total.toLocaleString('ru-RU')} <span className="text-base text-slate-400">₽</span>
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#fff] to-[#eef5f5] text-slate-600 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-white/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1)] active:scale-95"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ChevronUp className="h-6 w-6 drop-shadow-sm text-slate-700" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
              isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            )}
          >
            {/* Открытое состояние */}
            <div className="space-y-5">
              {/* Заголовок */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <h3 className="text-sm font-bold text-slate-700 tracking-widest uppercase drop-shadow-sm">Детализация</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 rounded-full bg-white/40 hover:bg-white/80 flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 backdrop-blur-sm border border-white/50 shadow-sm"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Список разбивки */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-400/50">
                {breakdown.map((section, index) => (
                  <div 
                    key={index} 
                    className="group p-4 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 border border-white/50 hover:border-white/80 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl ring-1 ring-white/40 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:scale-[1.01]"
                  >
                    {/* Категория */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[15px] text-slate-700 font-semibold tracking-wide group-hover:text-slate-900 transition-colors">{section.category}</span>
                      <span className="text-[15px] text-slate-700 font-semibold tabular-nums bg-white/50 px-2 py-0.5 rounded-lg shadow-sm border border-white/50">
                        {section.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    {/* Подпункты */}
                    {section.items && section.items.length > 0 && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/60">
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-start justify-between text-sm text-slate-500 group-hover:text-slate-600 transition-colors"
                          >
                            <span className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50 mt-2 shrink-0 shadow-[0_0_8px_rgba(148,163,184,0.5)]" />
                              <span className="leading-relaxed font-medium">{item.name}</span>
                            </span>
                            {item.price !== undefined && (
                              <span className="ml-3 whitespace-nowrap tabular-nums opacity-70 font-medium">
                                {item.price.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Итого */}
              <div 
                className="flex items-center justify-between pt-5 border-t border-slate-200/60"
              >
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest drop-shadow-sm">Итого к оплате</span>
                <span className="text-3xl font-light text-slate-800 tabular-nums drop-shadow-sm">
                  {total.toLocaleString('ru-RU')} <span className="text-lg text-slate-400 font-thin">₽</span>
                </span>
              </div>

              {/* Кнопки действий */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 border-white/60 bg-white/40 hover:bg-white/60 text-slate-600 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ring-1 ring-white/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Download className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity text-slate-700" />
                  <span>PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 border-white/60 bg-white/40 hover:bg-white/60 text-slate-600 h-12 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm ring-1 ring-white/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Share2 className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity text-slate-700" />
                  <span>Поделиться</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}