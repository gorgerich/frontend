'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

import { Check } from './Icons';
import { cn } from './ui/utils';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;              // индекс шага: 0, 1, 2...
  onStepClick?: (stepIndex: number) => void;
  completedSteps?: number[];
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
}: StepperProps) {
  const radius = 280; // радиус дуги
  const totalSteps = steps.length;
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // позиция шага на дуге относительно текущего шага
  const getStepPosition = (relativeIndex: number) => {
    // распределяем по 120°
    const angleRange = 120;
    const anglePerStep = angleRange / (totalSteps - 1 || 1);

    // relativeIndex = 0 — текущий шаг (центр)
    const centerAngle = 90; // 90° — верхняя точка дуги
    const angle =
      (centerAngle - anglePerStep * relativeIndex) * (Math.PI / 180);

    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius * 0.6 + 171;

    return { x, y, angle };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!onStepClick) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // свайп именно горизонтальный
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentStep > 0) {
        // вправо — предыдущий шаг
        onStepClick(currentStep - 1);
      } else if (deltaX < 0 && currentStep < totalSteps - 1) {
        // влево — следующий шаг
        onStepClick(currentStep + 1);
      }
    }
  };

  return (
    <div
      className="w-full py-2 relative overflow-hidden"
      style={{ height: '140px', minHeight: '140px', maxHeight: '140px' }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* контейнер шагов */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {steps.map((step, index) => {
            const isCompleted =
              completedSteps.includes(index) || index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = !!onStepClick;

            const relativeIndex = index - currentStep;
            const position = getStepPosition(relativeIndex);

            const distanceFromCurrent = Math.abs(relativeIndex);
            const scale = Math.max(0.7, 1 - distanceFromCurrent * 0.15);
            const opacity = Math.max(0.3, 1 - distanceFromCurrent * 0.25);

            // далеко — не показываем
            if (Math.abs(relativeIndex) > 2) {
              return null;
            }

            return (
              <motion.div
                key={step.id}
                className="absolute"
                initial={false}
                animate={{
                  x: position.x,
                  y: position.y,
                  scale,
                  opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  mass: 0.8,
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                  {/* круг шага */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable}
                    className={cn(
                      'shrink-0 z-10 relative outline-none',
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    )}
                    style={{ perspective: '1000px' }}
                  >
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.15 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                      }}
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative bg-white',
                        isCompleted && 'bg-gray-900 border-gray-900',
                        isCurrent &&
                          'border-gray-900 bg-white shadow-xl ring-4 ring-gray-900/10',
                        !isCompleted &&
                          !isCurrent &&
                          'border-gray-300 bg-white',
                        isClickable &&
                          !isCurrent &&
                          'hover:border-gray-700 hover:shadow-md hover:scale-110'
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <span
                          className={cn(
                            'text-base transition-colors',
                            isCurrent && 'text-gray-900',
                            isCompleted &&
                              !isCurrent &&
                              'text-white',
                            !isCompleted &&
                              !isCurrent &&
                              'text-gray-400'
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </motion.div>
                  </button>

                  {/* подпись под кругом */}
                  <motion.div
                    className="flex flex-col items-center text-center mt-3"
                    animate={{
                      opacity: isCurrent ? 1 : 0.6,
                      y: isCurrent ? 0 : 3,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 15,
                    }}
                  >
                    <span
                      className={cn(
                        "text-sm transition-all duration-300 whitespace-nowrap text-white font-medium"
                      )}
                    >
                      {step.label}
                    </span>
                    {step.description && isCurrent && (
                      <span className="text-xs text-gray-500 md:text-white mt-0.5 whitespace-nowrap">
                        {step.description}
                      </span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}