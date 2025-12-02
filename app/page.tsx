'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { StepperWorkflow } from './components/StepperWorkflow';
import { PackagesSection } from './components/PackagesSection';
import { FloatingCalculator } from './components/FloatingCalculator';
import {
  calculateTotal,
  calculateBreakdown,
} from './components/calculationUtils';

export default function Home() {
  // Глобальный обработчик ошибок для предотвращения краша из-за hls.js и других внешних библиотек
  useEffect(() => {
    const originalWorkerPostMessage = Worker.prototype.postMessage;
    const originalPortPostMessage = MessagePort.prototype.postMessage;

    const safePostMessage = (originalMethod: Function, instance: any, args: any[]) => {
      try {
        if (args[0]) {
          try {
            const dataStr = JSON.stringify(args[0]);
            if (dataStr.length > 5000000) {
              console.warn('Suppressed postMessage: data too large', dataStr.length);
              return;
            }
          } catch {
            console.warn('Suppressed postMessage: cannot stringify data');
            return;
          }
        }
        return originalMethod.apply(instance, args);
      } catch (error) {
        console.warn(
          'Suppressed postMessage error:',
          error instanceof Error ? error.message : error
        );
        return;
      }
    };

    Worker.prototype.postMessage = function (...args) {
      return safePostMessage(originalWorkerPostMessage, this, args);
    };

    MessagePort.prototype.postMessage = function (...args) {
      return safePostMessage(originalPortPostMessage, this, args);
    };

    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (
          event.message.includes('DataCloneError') ||
          event.message.includes('postMessage') ||
          event.message.includes('hls.js') ||
          event.message.includes('out of memory') ||
          event.message.includes('esm.sh/hls') ||
          event.message.includes('cannot be cloned') ||
          event.message.includes('DedicatedWorkerGlobalScope')
        )
      ) {
        console.warn('Intercepted and suppressed worker error:', event.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      if (
        event.error instanceof Error &&
        (
          event.error.name === 'DataCloneError' ||
          event.error.message.includes('out of memory') ||
          event.error.message.includes('cannot be cloned')
        )
      ) {
        console.warn('Intercepted worker error object:', event.error.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      if (
        message &&
        (
          message.includes('DataCloneError') ||
          message.includes('postMessage') ||
          message.includes('hls.js') ||
          message.includes('out of memory') ||
          message.includes('esm.sh/hls') ||
          message.includes('cannot be cloned') ||
          message.includes('DedicatedWorkerGlobalScope')
        )
      ) {
        console.warn(
          'Intercepted and suppressed worker promise rejection:',
          message
        );
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      Worker.prototype.postMessage = originalWorkerPostMessage;
      MessagePort.prototype.postMessage = originalPortPostMessage;
    };
  }, []);

  // Принудительный скролл к началу при первой загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Глобальное состояние формы для синхронизации между компонентами
  const initialFormData = {
    // Формат
    serviceType: 'burial' as 'burial' | 'cremation',
    hasHall: true,
    hallDuration: 60,
    ceremonyType: 'civil', // civil, religious, combined
    confession: '',
    ceremonyOrder: 'civil-first', // для комбинированной

    // Логистика
    cemetery: '',
    selectedSlot: '',
    needsHearse: true,
    hearseRoute: {
      morgue: true,
      hall: true,
      church: true,
      cemetery: true,
    },
    needsFamilyTransport: false,
    familyTransportSeats: 5,
    distance: '',
    needsPallbearers: true,

    // Атрибутика
    packageType: '' as 'basic' | 'standard' | 'premium' | 'custom' | '',
    selectedAdditionalServices: [] as string[],
    specialRequests: '',

    // Документы
    fullName: '',
    birthDate: '',
    deathDate: '',
    deathCertificate: '',
    relationship: '',
    dataConsent: false,

    // Контакты клиента (то, чего не хватало типу StepperWorkflowProps)
    clientName: '',
    clientEmail: '',
    userEmail: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<'standard' | 'comfort' | 'premium'>('standard');

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem('funeral-workflow-draft');
      if (saved) {
        if (saved.length > 1000000) {
          console.warn('Saved draft too large, removing...');
          localStorage.removeItem('funeral-workflow-draft');
          return;
        }

        try {
          const parsed = JSON.parse(saved);
          const loadedFormData = {
            ...initialFormData,
            ...parsed.formData,
            hearseRoute: {
              ...initialFormData.hearseRoute,
              ...(parsed.formData.hearseRoute || {}),
            },
            selectedAdditionalServices:
              parsed.formData.selectedAdditionalServices || [],
            birthDate: parsed.formData.birthDate === '—' ? '' : parsed.formData.birthDate,
            deathDate: parsed.formData.deathDate === '—' ? '' : parsed.formData.deathDate,
          };
          setFormData(loadedFormData);
        } catch (e) {
          console.error('Failed to parse draft:', e);
          localStorage.removeItem('funeral-workflow-draft');
        }
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
      try {
        localStorage.removeItem('funeral-workflow-draft');
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }
    }
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    try {
      const draft = {
        formData,
        savedAt: new Date().toISOString(),
      };
      const draftString = JSON.stringify(draft);

      if (draftString.length > 500000) {
        console.warn('Draft too large, skipping save');
        return;
      }

      localStorage.setItem('funeral-workflow-draft', draftString);
    } catch (e) {
      console.error('Failed to save draft:', e);
      try {
        localStorage.removeItem('funeral-workflow-draft');
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          try {
            const item = localStorage.getItem(key);
            if (item && item.length > 100000) {
              localStorage.removeItem(key);
            }
          } catch {
            // ignore
          }
        });
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }
    }
  }, [formData]);

  const handleUpdateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleCemeteryCategoryChange = (
    category: 'standard' | 'comfort' | 'premium',
  ) => {
    setSelectedCemeteryCategory(category);
  };

  return (
    <div className="min-h-screen bg-white pt-8">
      <HeroSection />

      <div className="relative z-20 stepper-overlay-position">
        <StepperWorkflow
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
          onStepChange={handleStepChange}
          onCemeteryCategoryChange={handleCemeteryCategoryChange}
        />
      </div>

      {currentStep === 2 && (
        <PackagesSection
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
        />
      )}

      {currentStep >= 1 && (
        <FloatingCalculator
          total={calculateTotal(formData, selectedCemeteryCategory)}
          breakdown={calculateBreakdown(formData, selectedCemeteryCategory)}
        />
      )}
    </div>
  );
}