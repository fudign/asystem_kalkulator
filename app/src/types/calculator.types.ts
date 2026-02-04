export interface ServiceOption {
  id: string;
  name: string;
  price: number;
  description: string;
  hasQuantity?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  options: ServiceOption[];
}

export interface SelectedOption {
  optionId: string;
  categoryId: string;
  quantity: number;
  price: number;
}

export interface CalculatorState {
  selectedOptions: Map<string, SelectedOption>;
  discount: number;
  activeCategory: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
