'use client';

import { cn } from '@/lib/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="flex items-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(
            'h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer',
            className
          )}
          {...props}
        />
        {label && <span className="ml-2 text-gray-700">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
