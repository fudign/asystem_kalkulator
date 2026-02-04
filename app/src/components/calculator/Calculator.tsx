'use client';

import { useState } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { OptionsList } from './OptionsList';
import { DiscountPanel } from './DiscountPanel';
import { TotalPanel } from './TotalPanel';
import { useCalculatorStore } from '@/store/calculatorStore';
import { generatePdf } from '@/lib/pdf';

export function Calculator() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { getSelectedOptionsArray, getSubtotal, getDiscountAmount, getTotal, discount } =
    useCalculatorStore();

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const selectedOptions = getSelectedOptionsArray();
      await generatePdf({
        selectedOptions,
        subtotal: getSubtotal(),
        discount,
        discountAmount: getDiscountAmount(),
        total: getTotal(),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Калькулятор IT-услуг
          </h1>
          <p className="text-gray-600">
            Выберите необходимые услуги и получите расчет стоимости
          </p>
        </header>

        <div className="mb-6">
          <CategoryTabs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <OptionsList />
            </div>
            <DiscountPanel />
          </div>

          <div className="lg:col-span-1">
            <TotalPanel
              onGeneratePdf={handleGeneratePdf}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
