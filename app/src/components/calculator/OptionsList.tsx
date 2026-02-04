'use client';

import { useCalculatorStore } from '@/store/calculatorStore';
import { categories } from '@/data/categories';
import { OptionItem } from './OptionItem';

export function OptionsList() {
  const { activeCategory } = useCalculatorStore();

  const category = categories.find((c) => c.id === activeCategory);

  if (!category) {
    return (
      <div className="text-center py-8 text-gray-500">
        Категория не найдена
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {category.icon && <span className="mr-2">{category.icon}</span>}
        {category.name}
      </h2>
      {category.options.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет доступных опций
        </div>
      ) : (
        category.options.map((option) => (
          <OptionItem
            key={option.id}
            option={option}
            categoryId={category.id}
          />
        ))
      )}
    </div>
  );
}
