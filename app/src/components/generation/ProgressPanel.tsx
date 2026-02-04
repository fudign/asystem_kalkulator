'use client';

import { useGenerationStatus } from '@/store/contextStore';
import { cn } from '@/lib/cn';

const STEPS = [
  { id: 'analysis', name: 'Анализ требований', icon: '📋' },
  { id: 'brief', name: 'Product Brief', icon: '📝' },
  { id: 'prd', name: 'Техническое задание', icon: '📄' },
  { id: 'architecture', name: 'Архитектура', icon: '🏗️' },
  { id: 'demo', name: 'Создание демо-сайта', icon: '💻' },
  { id: 'screenshots', name: 'Скриншоты', icon: '📸' },
  { id: 'pdf', name: 'Формирование КП', icon: '📑' },
];

export function ProgressPanel() {
  const status = useGenerationStatus();

  if (!status) return null;

  // Safely extract progress value (handle both number and nested object)
  const progressValue = typeof status.progress === 'number'
    ? status.progress
    : (typeof status.progress === 'object' && status.progress !== null)
      ? (status.progress as any).progress ?? 0
      : 0;

  // Safely extract currentStep
  const stepValue = typeof status.currentStep === 'string'
    ? status.currentStep
    : (typeof status.progress === 'object' && status.progress !== null)
      ? (status.progress as any).currentStep ?? 'analysis'
      : 'analysis';

  const currentStepIndex = STEPS.findIndex((s) => s.id === stepValue);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Генерация вашего проекта
      </h3>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Прогресс</span>
          <span>{progressValue}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                isCompleted && 'bg-green-50',
                isCurrent && 'bg-blue-50',
                isPending && 'bg-gray-50 opacity-60'
              )}
            >
              <span className="text-xl">{step.icon}</span>
              <span
                className={cn(
                  'flex-1 text-sm',
                  isCompleted && 'text-green-700',
                  isCurrent && 'text-blue-700 font-medium',
                  isPending && 'text-gray-500'
                )}
              >
                {step.name}
              </span>
              <span className="text-sm">
                {isCompleted && '✅'}
                {isCurrent && '🔄'}
                {isPending && '⏳'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {status.state === 'waiting_for_input' && status.question && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⏸️ Ожидает вашего ответа...
          </p>
        </div>
      )}

      {status.state === 'failed' && status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ❌ Ошибка: {status.error}
          </p>
        </div>
      )}
    </div>
  );
}
