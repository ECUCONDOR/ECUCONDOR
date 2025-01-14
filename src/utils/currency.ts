import { CURRENCIES } from '@/constants/currencies';

export const formatCurrency = (amount: number, currencyCode: keyof typeof CURRENCIES) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatCurrencyValue = (value: number, currency: string): string => {
  // Formato especial para USDT
  if (currency === 'USDT') {
    return `USDT ${value.toFixed(2)}`;
  }

  // Para otras monedas, usar Intl.NumberFormat
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
};

export const formatExchangeRate = (rate: number, fromCurrency: string, toCurrency: string): string => {
  if (fromCurrency === 'USDT') {
    return `1 USDT = ${formatCurrencyValue(rate, toCurrency)}`;
  } else if (toCurrency === 'USDT') {
    return `${formatCurrencyValue(1, fromCurrency)} = ${rate.toFixed(2)} USDT`;
  }
  return `${formatCurrencyValue(1, fromCurrency)} = ${formatCurrencyValue(rate, toCurrency)}`;
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const calculateExchangeAmount = (
  amount: number,
  rate: number,
  includeCommission: boolean = false,
  commissionRate: number = 0.03
) => {
  let result = amount * rate;
  if (includeCommission) {
    result = result * (1 - commissionRate);
  }
  return result;
};
