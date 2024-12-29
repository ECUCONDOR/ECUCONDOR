'use client'

import React from 'react'
import { ExchangePair, ExchangeRate } from '@/types/exchange'
import { Input } from '@/components/ui/input'
import { COLORS } from '@/constants/colors'
import TrendIndicator from './TrendIndicator'
import { exchangeOptions } from '@/constants/exchangeOptions'
import CurrencyIcon from './CurrencyIcon'

interface ExchangePanelProps {
  selectedOption: ExchangePair
  rates: Record<ExchangePair, ExchangeRate>
  amount: string
  setAmount: (value: string) => void
  debouncedAmount: string
  className?: string
}

const ExchangePanel: React.FC<ExchangePanelProps> = ({ 
  selectedOption, 
  rates, 
  amount,
  setAmount,
  debouncedAmount,
  className
}) => {
  const [fromCurrency, toCurrency] = selectedOption.split('-')
  const rate = rates[selectedOption]
  const option = exchangeOptions.find(opt => opt.id === selectedOption)
  const toOption = exchangeOptions.find(opt => opt.baseSymbol === toCurrency)

  return (
    <div className={[className, "rounded-xl p-6"].join(' ')} style={{ backgroundColor: COLORS.card }}>
      <div className="space-y-6">
        {/* Mostrar tasa actual */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.surface }}>
          <div className="flex justify-between items-center">
            <span style={{ color: COLORS.textMuted }}>Tasa actual:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <CurrencyIcon currency={fromCurrency} size={20} className="mr-1" />
                <span>1 {fromCurrency}</span>
              </div>
              <span>=</span>
              <div className="flex items-center">
                <CurrencyIcon currency={toCurrency} size={20} className="mr-1" />
                <span className="text-xl font-bold" style={{ color: COLORS.text }}>
                  {rate?.value ? `${rate.value.toFixed(2)} ${toCurrency}` : 'Cargando...'}
                </span>
              </div>
            </div>
          </div>
          {rate?.change24h && (
            <div className="mt-2 flex justify-end">
              <TrendIndicator rate={rate} />
            </div>
          )}
        </div>

        {/* Input de cantidad */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>
              Cantidad a convertir
            </label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-16 py-2"
                placeholder="0.00"
                style={{
                  backgroundColor: COLORS.input,
                  color: COLORS.text,
                  borderColor: COLORS.border,
                }}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyIcon currency={fromCurrency} size={16} className="text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sm" style={{ color: COLORS.textMuted }}>{fromCurrency}</span>
              </div>
            </div>
          </div>

          {/* Resultado de la conversión */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textMuted }}>
              Recibirás
            </label>
            <div className="relative">
              <div
                className="w-full pl-10 pr-16 py-2 rounded-md"
                style={{
                  backgroundColor: COLORS.input,
                  color: COLORS.text,
                  borderColor: COLORS.border,
                }}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyIcon currency={toCurrency} size={16} className="text-gray-400" />
                </div>
                <span className="font-bold">
                  {rate?.value && debouncedAmount
                    ? (parseFloat(debouncedAmount) * rate.value).toFixed(2)
                    : '0.00'}
                </span>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>{toCurrency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangePanel
