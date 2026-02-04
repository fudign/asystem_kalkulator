'use client';

import { cn } from '@/lib/cn';
import { useCalculatorStore } from '@/store/calculatorStore';

const discountOptions = [0, 5, 10, 15, 20, 25];

export function DiscountPanel() {
  const { discount, setDiscount } = useCalculatorStore();

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Скидка</h3>
      <div className="flex flex-wrap gap-2">
        {discountOptions.map((value) => (
          <button
            key={value}
            onClick={() => setDiscount(value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              discount === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {value === 0 ? 'Без скидки' : `${value}%`}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <label className="text-sm text-gray-600">Или введите вручную:</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            value={discount}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 0 && value <= 100) {
                setDiscount(value);
              }
            }}
            min={0}
            max={100}
            className={cn(
              'w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />
          <span className="text-gray-600">%</span>
        </div>
      </div>
    </div>
  );
}
