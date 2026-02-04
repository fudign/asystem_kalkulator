'use client';

import { cn } from '@/lib/cn';
import { useCalculatorStore } from '@/store/calculatorStore';
import { categories } from '@/data/categories';

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useCalculatorStore();

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl min-w-max">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeCategory === category.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {category.icon && <span className="mr-2">{category.icon}</span>}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
