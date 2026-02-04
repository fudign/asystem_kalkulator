'use client';

import { useContextStore, useIsReadyToGenerate, useMissingFields } from '@/store/contextStore';
import { cn } from '@/lib/cn';

interface GenerateButtonProps {
  onGenerate?: () => void;
}

export function GenerateButton({ onGenerate }: GenerateButtonProps) {
  const isReady = useIsReadyToGenerate();
  const missingFields = useMissingFields();
  const context = useContextStore();

  const fieldLabels: Record<string, string> = {
    projectName: 'Название проекта',
    businessType: 'Тип бизнеса',
    targetAudience: 'Целевая аудитория',
    mainFeatures: 'Основные функции',
  };

  const handleClick = () => {
    if (isReady && onGenerate) {
      onGenerate();
    }
  };

  console.log('[GenerateButton] isReady:', isReady, 'missing:', missingFields);

  if (!isReady) {
    return (
      <div className="p-2 bg-amber-100 rounded-lg border-2 border-amber-400 text-center">
        <p className="text-xs font-bold text-amber-800">
          ⚠️ Нужно: {missingFields.map(f => fieldLabels[f] || f).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Context summary */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-green-800 mb-2">
          ✅ Достаточно данных для генерации!
        </p>
        <div className="text-xs text-green-700 space-y-1">
          {context.businessType && (
            <p>• Бизнес: {context.businessType}</p>
          )}
          {context.mainFeatures.length > 0 && (
            <p>• Функции: {context.mainFeatures.slice(0, 3).join(', ')}{context.mainFeatures.length > 3 && '...'}</p>
          )}
          {context.budget && (
            <p>• Бюджет: ${context.budget.min} - ${context.budget.max}</p>
          )}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleClick}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-medium transition-all',
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
          'hover:from-blue-700 hover:to-indigo-700',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center gap-2'
        )}
      >
        <span>🚀</span>
        <span>Сгенерировать КП и демо</span>
      </button>
      <p className="text-xs text-center text-gray-500">
        Займёт 15-20 минут
      </p>
    </div>
  );
}
