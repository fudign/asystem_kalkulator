'use client';

import { cn } from '@/lib/cn';
import { ServiceOption } from '@/types/calculator.types';
import { useCalculatorStore } from '@/store/calculatorStore';
import { formatCurrency } from '@/lib/formatters';
import { QuantityInput } from './QuantityInput';
import { Tooltip } from '@/components/ui';

interface OptionItemProps {
  option: ServiceOption;
  categoryId: string;
}

export function OptionItem({ option, categoryId }: OptionItemProps) {
  const { isOptionSelected, toggleOption, getOptionQuantity, setQuantity } =
    useCalculatorStore();

  const isSelected = isOptionSelected(option.id);
  const quantity = getOptionQuantity(option.id);
  const totalPrice = option.hasQuantity ? option.price * quantity : option.price;

  const handleToggle = () => {
    toggleOption(
      categoryId,
      option.id,
      option.price,
      option.name,
      option.hasQuantity
    );
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(option.id, newQuantity);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      )}
      onClick={handleToggle}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 bg-white'
          )}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {option.name}
            </span>
            {option.description && (
              <Tooltip content={option.description} position="top">
                <span className="text-gray-400 hover:text-gray-600 cursor-help">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {option.hasQuantity && isSelected && (
          <div onClick={(e) => e.stopPropagation()}>
            <QuantityInput
              value={quantity}
              onChange={handleQuantityChange}
              min={option.minQuantity || 1}
              max={option.maxQuantity || 100}
            />
          </div>
        )}
        <div className="text-right min-w-[100px]">
          <span className="font-semibold text-gray-900">
            {formatCurrency(totalPrice)}
          </span>
          {option.hasQuantity && (
            <span className="block text-xs text-gray-500">
              {formatCurrency(option.price)} / шт.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
