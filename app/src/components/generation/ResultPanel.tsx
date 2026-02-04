'use client';

import { useState } from 'react';
import { useGenerationStatus } from '@/store/contextStore';
import { cn } from '@/lib/cn';

export function ResultPanel() {
  const status = useGenerationStatus();
  const [selectedScreenshot, setSelectedScreenshot] = useState<number>(0);

  if (!status?.result || status.state !== 'completed') {
    return null;
  }

  const { result } = status;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Success header */}
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">🎉</span>
        <h3 className="text-xl font-bold text-gray-800">
          Ваше КП готово!
        </h3>
        <p className="text-gray-600 mt-1">
          Скачайте материалы или посмотрите демо
        </p>
      </div>

      {/* Download PDF */}
      <a
        href={result.pdfUrl}
        download
        className={cn(
          'w-full py-4 px-4 rounded-lg font-medium transition-all',
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
          'hover:from-blue-700 hover:to-indigo-700',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center gap-3 mb-6'
        )}
      >
        <span>📄</span>
        <span>Скачать КП (PDF)</span>
      </a>

      {/* Screenshots gallery */}
      {result.screenshots.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-800 mb-4">
            Демо-скриншоты сайта
          </h4>

          {/* Main screenshot */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={result.screenshots[selectedScreenshot]}
              alt={`Screenshot ${selectedScreenshot + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail navigation */}
          {result.screenshots.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {result.screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedScreenshot(index)}
                  className={cn(
                    'flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors',
                    selectedScreenshot === index
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <img
                    src={screenshot}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expiration notice */}
      <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          ⏰ Материалы доступны до{' '}
          {result.expiresAt.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Contact CTA */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-3">
          Понравилось? Давайте обсудим проект!
        </p>
        <a
          href="tel:+996XXXXXXXXX"
          className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>📞</span>
          <span>Связаться с нами</span>
        </a>
      </div>
    </div>
  );
}
