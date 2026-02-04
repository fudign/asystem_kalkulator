// Intake validation

import { INTAKE_QUESTIONS, getRequiredQuestions } from './questions';

export interface IntakeData {
  companyName?: string;
  businessType?: string;
  businessDescription?: string;
  targetAudience?: string;
  competitors?: string[];
  siteGoals?: string[];
  designPreferences?: string;
  additionalNotes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  missingFields: string[];
}

export function validateIntake(data: IntakeData): ValidationResult {
  const errors: Record<string, string> = {};
  const missingFields: string[] = [];

  // Minimal required fields for pipeline to work
  if (!data.companyName || data.companyName.trim() === '') {
    missingFields.push('companyName');
    errors.companyName = 'Название компании обязательно';
  }

  if (!data.businessType || data.businessType.trim() === '') {
    missingFields.push('businessType');
    errors.businessType = 'Тип бизнеса обязателен';
  }

  // Validate email format if provided
  if (data.contactEmail && !isValidEmail(data.contactEmail)) {
    errors.contactEmail = 'Неверный формат email';
  }

  // Validate phone format if provided
  if (data.contactPhone && !isValidPhone(data.contactPhone)) {
    errors.contactPhone = 'Неверный формат телефона';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingFields,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Allow various formats: +996, 0, spaces, dashes
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  return phoneRegex.test(phone);
}

// Check if intake is complete enough to proceed
export function isIntakeComplete(data: IntakeData): boolean {
  const result = validateIntake(data);
  return result.isValid;
}
