import type { ExchangeOption } from '@/types/exchange';

export const exchangeOptions: ExchangeOption[] = [
  { id: 'USD', name: 'US Dollar', symbol: '$' },
  { id: 'EUR', name: 'Euro', symbol: '€' },
  { id: 'GBP', name: 'British Pound', symbol: '£' },
  { id: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { id: 'ARS', name: 'Argentine Peso', symbol: '$' },
];

export const initialRates = {
  USD: { EUR: 0.91, GBP: 0.79, JPY: 145.32, ARS: 823.45 },
  EUR: { USD: 1.10, GBP: 0.86, JPY: 158.89, ARS: 900.12 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 184.75, ARS: 1045.67 },
  JPY: { USD: 0.0069, EUR: 0.0063, GBP: 0.0054, ARS: 5.67 },
  ARS: { USD: 0.0012, EUR: 0.0011, GBP: 0.00096, JPY: 0.176 },
};
