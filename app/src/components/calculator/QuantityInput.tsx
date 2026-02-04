'use client';

import { cn } from '@/lib/cn';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 100,
  className,
}: QuantityInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300',
          'text-gray-600 hover:bg-gray-100 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={cn(
          'w-14 h-8 text-center border border-gray-300 rounded-lg',
          'text-sm font-medium text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300',
          'text-gray-600 hover:bg-gray-100 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        +
      </button>
    </div>
  );
}
