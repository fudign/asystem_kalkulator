'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { INTAKE_QUESTIONS, SITE_GOALS, DESIGN_STYLES, BUSINESS_TYPES } from './questions';
import { validateIntake, type IntakeData } from './validation';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (projectId: string) => void;
}

export function IntakeModal({ isOpen, onClose, onComplete }: IntakeModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Pre-fill contact info from session
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || session.user?.name || '',
        contactEmail: prev.contactEmail || session.user?.email || '',
        contactPhone: prev.contactPhone || (session.user as any)?.phone || '',
      }));
    }
  }, [session]);

  if (!isOpen) return null;

  const currentQuestion = INTAKE_QUESTIONS[currentStep];
  const totalSteps = INTAKE_QUESTIONS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    // Validate current field if required
    if (currentQuestion.required) {
      const value = formData[currentQuestion.id as keyof IntakeData];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setErrors({ [currentQuestion.id]: 'Это поле обязательно' });
        return;
      }
    }

    setErrors({});

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    const validation = validateIntake(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      // Go to first error field
      const firstErrorField = validation.missingFields[0];
      const errorIndex = INTAKE_QUESTIONS.findIndex(q => q.id === firstErrorField);
      if (errorIndex >= 0) {
        setCurrentStep(errorIndex);
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/generator/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || 'Ошибка отправки' });
        setLoading(false);
        return;
      }

      onComplete(data.projectId);
    } catch (error) {
      setErrors({ submit: 'Произошла ошибка. Попробуйте снова.' });
      setLoading(false);
    }
  };

  const handleChange = (value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    setErrors({});
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      handleChange(newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    handleChange(newTags);
  };

  const handleMultiSelect = (id: string) => {
    const current = (formData[currentQuestion.id as keyof IntakeData] as string[]) || [];
    const newValue = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    handleChange(newValue);
  };

  const renderInput = () => {
    const value = formData[currentQuestion.id as keyof IntakeData];
    const error = errors[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={currentQuestion.type}
            value={(value as string) || ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={(value as string) || ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            rows={4}
            className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
        );

      case 'select':
        const options = currentQuestion.id === 'businessType'
          ? BUSINESS_TYPES
          : currentQuestion.id === 'designPreferences'
          ? DESIGN_STYLES.map(s => s.label)
          : [];

        return (
          <div className="grid grid-cols-2 gap-2">
            {(Array.isArray(options) ? options : []).map((option, idx) => {
              const optionValue = typeof option === 'string' ? option : option;
              const isSelected = value === optionValue;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChange(optionValue)}
                  className={`px-4 py-3 text-left rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {optionValue}
                </button>
              );
            })}
          </div>
        );

      case 'multiselect':
        const selected = (value as string[]) || [];
        return (
          <div className="grid grid-cols-2 gap-2">
            {SITE_GOALS.map(goal => {
              const isSelected = selected.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleMultiSelect(goal.id)}
                  className={`px-4 py-3 text-left rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="mr-2">{isSelected ? '✓' : '○'}</span>
                  {goal.label}
                </button>
              );
            })}
          </div>
        );

      case 'tags':
        return (
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder={currentQuestion.placeholder}
                className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Добавить
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Можете оставить пустым — мы найдём конкурентов автоматически
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Шаг {currentStep + 1} из {totalSteps}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentQuestion.question}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h3>

          {currentQuestion.description && (
            <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
          )}

          <div className="mb-4">
            {renderInput()}
          </div>

          {errors[currentQuestion.id] && (
            <p className="text-red-500 text-sm mb-4">{errors[currentQuestion.id]}</p>
          )}

          {errors.submit && (
            <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Назад
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Отправка...'
            ) : currentStep === totalSteps - 1 ? (
              'Создать проект →'
            ) : (
              'Далее →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
