'use client';

import { useCalculatorStore } from '@/store/calculatorStore';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui';

interface TotalPanelProps {
  onGeneratePdf?: () => void;
  isGeneratingPdf?: boolean;
}

export function TotalPanel({ onGeneratePdf, isGeneratingPdf }: TotalPanelProps) {
  const { getSubtotal, getDiscountAmount, getTotal, discount, getSelectedOptionsArray, reset } =
    useCalculatorStore();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();
  const selectedOptions = getSelectedOptionsArray();
  const hasSelections = selectedOptions.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg sticky top-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Итого</h3>

        {hasSelections ? (
          <>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {selectedOptions.map((option) => (
                <div
                  key={option.optionId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600 truncate mr-2">
                    {option.name}
                    {option.quantity > 1 && (
                      <span className="text-gray-400 ml-1">
                        x{option.quantity}
                      </span>
                    )}
                  </span>
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    {formatCurrency(option.price * option.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Подытог</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Скидка ({discount}%)</span>
                  <span className="text-green-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Итого</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>Выберите услуги для расчета</p>
          </div>
        )}
      </div>

      {hasSelections && (
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            onClick={onGeneratePdf}
            disabled={isGeneratingPdf}
            className="w-full"
          >
            {isGeneratingPdf ? 'Генерация PDF...' : 'Скачать PDF'}
          </Button>
          <Button variant="outline" onClick={reset} className="w-full">
            Сбросить выбор
          </Button>
        </div>
      )}
    </div>
  );
}
