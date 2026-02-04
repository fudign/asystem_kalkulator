'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COUNTRY_CODES = [
  { code: '+996', country: 'KG', name: 'Кыргызстан', format: '(XXX) XXX-XXX', length: 9 },
  { code: '+7', country: 'RU', name: 'Россия', format: '(XXX) XXX-XX-XX', length: 10 },
  { code: '+7', country: 'KZ', name: 'Казахстан', format: '(XXX) XXX-XX-XX', length: 10 },
  { code: '+998', country: 'UZ', name: 'Узбекистан', format: '(XX) XXX-XX-XX', length: 9 },
  { code: '+992', country: 'TJ', name: 'Таджикистан', format: '(XX) XXX-XX-XX', length: 9 },
  { code: '+993', country: 'TM', name: 'Туркменистан', format: '(XX) XXX-XXX', length: 8 },
  { code: '+374', country: 'AM', name: 'Армения', format: '(XX) XXX-XXX', length: 8 },
  { code: '+994', country: 'AZ', name: 'Азербайджан', format: '(XX) XXX-XX-XX', length: 9 },
  { code: '+995', country: 'GE', name: 'Грузия', format: '(XXX) XXX-XXX', length: 9 },
  { code: '+380', country: 'UA', name: 'Украина', format: '(XX) XXX-XX-XX', length: 9 },
  { code: '+375', country: 'BY', name: 'Беларусь', format: '(XX) XXX-XX-XX', length: 9 },
];

export function PhoneModal({ isOpen, onClose, onSuccess }: PhoneModalProps) {
  const { update } = useSession();
  const [countryIndex, setCountryIndex] = useState(0); // Default to Kyrgyzstan
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedCountry = COUNTRY_CODES[countryIndex];

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const len = selectedCountry.length;

    // Generic formatting based on country
    if (digits.length === 0) return '';

    // Format: (XXX) XXX-XXX or (XX) XXX-XX-XX depending on country
    if (selectedCountry.code === '+996') {
      // Kyrgyzstan: (XXX) XXX-XXX
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
    } else if (selectedCountry.code === '+7') {
      // Russia/Kazakhstan: (XXX) XXX-XX-XX
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      if (digits.length <= 8) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    } else {
      // Default format: (XX) XXX-XX-XX
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 5) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length <= selectedCountry.length) {
      setPhone(formatPhone(digits));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    if (digits.length < selectedCountry.length) {
      setError('Введите полный номер телефона');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.code} ${phone}`;

    try {
      const res = await fetch('/api/user/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка сохранения');
        return;
      }

      // Update session
      await update({ phone: fullPhone });

      onSuccess?.();
      onClose();
    } catch {
      setError('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Добавьте номер телефона
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Это поможет нам связаться с вами по готовности вашего проекта
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Номер телефона
            </label>
            <div className="flex gap-2">
              <select
                value={countryIndex}
                onChange={(e) => {
                  setCountryIndex(Number(e.target.value));
                  setPhone('');
                }}
                className="px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base bg-white"
              >
                {COUNTRY_CODES.map((country, idx) => (
                  <option key={`${country.country}-${idx}`} value={idx}>
                    {country.country} {country.code}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder={selectedCountry.format}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Пропустить
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          Мы не будем отправлять спам. Только уведомление о готовности проекта.
        </p>
      </div>
    </div>
  );
}
