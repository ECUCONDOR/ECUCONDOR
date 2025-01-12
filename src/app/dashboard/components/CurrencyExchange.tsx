'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowDownUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Currency = 'USD' | 'ARS'

interface ExchangeRate {
  USD_TO_ARS: number
  ARS_TO_USD: number
}

export function CurrencyExchange() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState<Currency>('USD')
  const [toCurrency, setToCurrency] = useState<Currency>('ARS')
  const [isLoading, setIsLoading] = useState(false)

  // Example exchange rates - in production, these should come from an API
  const exchangeRates: ExchangeRate = {
    USD_TO_ARS: 820.50,
    ARS_TO_USD: 1 / 820.50
  }

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const calculateExchange = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return '0.00'

    const rate = fromCurrency === 'USD' ? exchangeRates.USD_TO_ARS : exchangeRates.ARS_TO_USD
    return formatCurrency(numAmount * rate, toCurrency)
  }

  const handleExchange = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual exchange logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Success notification would go here
    } catch (error) {
      console.error('Error during exchange:', error)
      // Error notification would go here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Cambio de Divisas</h2>
      
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Monto</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-lg"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
          <Select value={fromCurrency} onValueChange={(value: Currency) => setFromCurrency(value)}>
            <SelectTrigger>
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapCurrencies}
            className="rounded-full"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>

          <Select value={toCurrency} onValueChange={(value: Currency) => setToCurrency(value)}>
            <SelectTrigger>
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exchange Rate Display */}
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Tasa de cambio:</p>
          <p className="text-lg font-semibold">
            1 {fromCurrency} = {
              fromCurrency === 'USD' 
                ? formatCurrency(exchangeRates.USD_TO_ARS, 'ARS')
                : formatCurrency(exchangeRates.ARS_TO_USD, 'USD')
            }
          </p>
        </div>

        {/* Converted Amount */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Recibirás:</p>
          <p className="text-2xl font-bold">{calculateExchange()}</p>
        </div>

        {/* Exchange Button */}
        <Button
          className="w-full h-12 text-lg"
          onClick={handleExchange}
          disabled={!amount || isLoading}
        >
          {isLoading ? 'Procesando...' : 'Realizar Cambio'}
        </Button>
      </div>
    </Card>
  )
}
