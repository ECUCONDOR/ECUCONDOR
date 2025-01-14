import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { formatCurrencyValue, formatExchangeRate, formatDateTime } from '@/utils/currency';

interface TransactionSummaryProps {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  commission?: number;
  timestamp: Date;
}

export function TransactionSummary({
  fromCurrency,
  toCurrency,
  amount,
  convertedAmount,
  rate,
  commission,
  timestamp
}: TransactionSummaryProps) {
  return (
    <Card className="bg-[#111827] p-6 border border-[#374151] shadow-lg">
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-[#374151] pb-4">
          <h3 className="text-xl font-semibold text-[#F3F4F6]">
            Resumen de la Transacción
          </h3>
          <time className="text-sm text-[#9CA3AF] bg-[#1F2937] px-3 py-1 rounded-full">
            {formatDateTime(timestamp)}
          </time>
        </div>

        {/* Detalles de la conversión */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#374151] text-center">
            <p className="text-sm text-[#9CA3AF] mb-1">Monto Original</p>
            <p className="text-lg font-medium text-[#F3F4F6]">
              {formatCurrencyValue(amount, fromCurrency)}
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="bg-[#1E40AF] p-2 rounded-full">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#374151] text-center">
            <p className="text-sm text-[#9CA3AF] mb-1">Monto Convertido</p>
            <p className="text-lg font-medium text-[#F3F4F6]">
              {formatCurrencyValue(convertedAmount, toCurrency)}
            </p>
          </div>
        </div>

        {/* Tasa y comisión */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#374151]">
            <p className="text-sm text-[#9CA3AF] mb-1">Tasa de Cambio</p>
            <p className="text-lg font-medium text-[#F3F4F6]">
              {formatExchangeRate(rate, fromCurrency, toCurrency)}
            </p>
          </div>
          
          {commission && (
            <div className="bg-[#1F2937] p-4 rounded-lg border border-[#374151]">
              <p className="text-sm text-[#9CA3AF] mb-1">Comisión</p>
              <p className="text-lg font-medium text-[#F3F4F6]">
                {formatCurrencyValue(commission, fromCurrency)}
              </p>
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <div className="mt-4 text-sm text-[#9CA3AF] bg-[#1F2937] p-4 rounded-lg border border-[#374151]">
          <p className="flex items-center">
            <span className="w-2 h-2 bg-[#3B82F6] rounded-full mr-2"></span>
            Los montos son calculados en tiempo real según la tasa de cambio actual
          </p>
        </div>
      </div>
    </Card>
  );
}
