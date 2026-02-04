import { SelectedOption } from '@/store/calculatorStore';

export function calculateSubtotal(options: SelectedOption[]): number {
  return options.reduce((sum, option) => sum + option.price * option.quantity, 0);
}

export function calculateDiscount(subtotal: number, discountPercent: number): number {
  return (subtotal * discountPercent) / 100;
}

export function calculateTotal(subtotal: number, discountAmount: number): number {
  return subtotal - discountAmount;
}

export function formatOptionPrice(price: number, quantity: number): string {
  const total = price * quantity;
  if (quantity > 1) {
    return `$${price} × ${quantity} = $${total}`;
  }
  return `$${total}`;
}
