'use client';

import { useState } from 'react';
import { useGenerationStatus } from '@/store/contextStore';
import { cn } from '@/lib/cn';

interface QuestionModalProps {
  onAnswer: (questionId: string, answer: string) => void;
  onClose?: () => void;
}

export function QuestionModal({ onAnswer, onClose }: QuestionModalProps) {
  const status = useGenerationStatus();
  const [answer, setAnswer] = useState('');

  if (!status?.question || status.state !== 'waiting_for_input') {
    return null;
  }

  const { question } = status;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswer(question.id, answer.trim());
      setAnswer('');
    }
  };

  const handleOptionClick = (option: string) => {
    onAnswer(question.id, option);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💬</span>
          <h3 className="text-lg font-semibold text-gray-800">
            Уточняющий вопрос
          </h3>
        </div>

        {/* Question */}
        <p className="text-gray-700 mb-4">
          {question.question}
        </p>

        {/* Options (if provided) */}
        {question.options && question.options.length > 0 ? (
          <div className="space-y-2 mb-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  'w-full p-3 text-left rounded-lg border transition-colors',
                  'hover:border-blue-300 hover:bg-blue-50',
                  'border-gray-200 bg-white'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          /* Free text input */
          <form onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Введите ваш ответ..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!answer.trim()}
              className={cn(
                'w-full mt-3 py-3 px-4 rounded-lg font-medium transition-colors',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:bg-gray-300 disabled:cursor-not-allowed'
              )}
            >
              Отправить ответ
            </button>
          </form>
        )}

        {/* Skip hint */}
        <p className="mt-4 text-xs text-center text-gray-500">
          Ваш ответ поможет создать более точное предложение
        </p>
      </div>
    </div>
  );
}
