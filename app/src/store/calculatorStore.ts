'use client';

import { create } from 'zustand';
import { categories } from '@/data/categories';

export interface SelectedOption {
  optionId: string;
  categoryId: string;
  quantity: number;
  price: number;
  name: string;
}

interface CalculatorState {
  selectedOptions: Map<string, SelectedOption>;
  discount: number;
  activeCategory: string;

  // Actions
  toggleOption: (categoryId: string, optionId: string, price: number, name: string, hasQuantity?: boolean) => void;
  setQuantity: (optionId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setActiveCategory: (categoryId: string) => void;
  reset: () => void;

  // Selectors
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  isOptionSelected: (optionId: string) => boolean;
  getOptionQuantity: (optionId: string) => number;
  getSelectedOptionsArray: () => SelectedOption[];
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  selectedOptions: new Map(),
  discount: 0,
  activeCategory: categories[0]?.id || 'landing',

  toggleOption: (categoryId, optionId, price, name, hasQuantity = false) => {
    set((state) => {
      const newMap = new Map(state.selectedOptions);

      if (newMap.has(optionId)) {
        newMap.delete(optionId);
      } else {
        newMap.set(optionId, {
          optionId,
          categoryId,
          quantity: hasQuantity ? 1 : 1,
          price,
          name,
        });
      }

      return { selectedOptions: newMap };
    });
  },

  setQuantity: (optionId, quantity) => {
    set((state) => {
      const newMap = new Map(state.selectedOptions);
      const option = newMap.get(optionId);

      if (option) {
        newMap.set(optionId, { ...option, quantity: Math.max(1, quantity) });
      }

      return { selectedOptions: newMap };
    });
  },

  setDiscount: (discount) => {
    set({ discount: Math.min(100, Math.max(0, discount)) });
  },

  setActiveCategory: (categoryId) => {
    set({ activeCategory: categoryId });
  },

  reset: () => {
    set({
      selectedOptions: new Map(),
      discount: 0,
    });
  },

  getSubtotal: () => {
    const { selectedOptions } = get();
    let total = 0;

    selectedOptions.forEach((option) => {
      total += option.price * option.quantity;
    });

    return total;
  },

  getDiscountAmount: () => {
    const { discount } = get();
    const subtotal = get().getSubtotal();
    return (subtotal * discount) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    return subtotal - discountAmount;
  },

  isOptionSelected: (optionId) => {
    return get().selectedOptions.has(optionId);
  },

  getOptionQuantity: (optionId) => {
    const option = get().selectedOptions.get(optionId);
    return option?.quantity || 1;
  },

  getSelectedOptionsArray: () => {
    return Array.from(get().selectedOptions.values());
  },
}));
