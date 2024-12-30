'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDebounce } from '@/hooks/useDebounce';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import ExchangePanel from '@/components/ExchangePanel';
import TrendIndicator from '@/components/TrendIndicator';
import DashboardLayout from '@/components/DashboardLayout';
import { COLORS } from '@/constants/colors';
import { exchangeOptions, initialRates } from '@/constants/exchangeOptions';
import type { ExchangePair, ExchangeRate } from '@/types/exchange';
import { formatTime } from '@/utils/timeUtils';

// Create a client-only TimeDisplay component
const TimeDisplay = dynamic(() => Promise.resolve(({ date }: { date: Date }) => (
  <span>{formatTime(date)}</span>
)), { ssr: false });

const ExchangePage = () => {
  const [selectedOption, setSelectedOption] = useState<ExchangePair>('USD-ARS');
  const [amount, setAmount] = useState('');
  const debouncedAmount = useDebounce(amount, 500);
  const [rates, setRates] = useState<Record<ExchangePair, ExchangeRate>>(initialRates);
  const binancePairs = ['btcusdt', 'wldusdt', 'usdtbrl', 'usdtars'];
  const { prices } = useBinanceWebSocket(binancePairs);

  const getPrice = (symbol: string) => {
    const price = prices?.find(p => p.symbol === symbol.toUpperCase());
    return price ? parseFloat(price.price) : 0;
  };

  // Función para obtener el precio formateado
  const getFormattedPrice = useCallback((symbol: string) => {
    const price = getPrice(symbol);
    return price ? {
      value: price,
      change24h: 0,
      lastUpdate: new Date()
    } : null;
  }, [prices]);

  // Memoizar la función de actualización de tasas
  const updateRates = useCallback(() => {
    const newRates = { ...rates };
    
    // Actualizar USDT/ARS
    const usdtArs = getFormattedPrice('USDTARS');
    if (usdtArs) {
      newRates['USD-ARS'] = {
        value: usdtArs.value * 0.96, // Reducir en 4%
        lastUpdate: usdtArs.lastUpdate,
        change24h: usdtArs.change24h
      };
    }

    // Actualizar BRL/ARS usando USDT como intermediario
    const usdtBrl = getFormattedPrice('USDTBRL');
    if (usdtBrl && usdtArs) {
      const brlArsValue = (usdtArs.value / usdtBrl.value) * 0.97; // Reducir en 3%
      newRates['BRL-ARS'] = {
        value: brlArsValue,
        lastUpdate: new Date(),
        change24h: 0
      };
      newRates['BRL-USD'] = {
        value: 1 / usdtBrl.value,
        lastUpdate: new Date(),
        change24h: 0
      };
    }

    // Actualizar otras criptomonedas
    const btcUsdt = getFormattedPrice('BTCUSDT');
    if (btcUsdt) {
      newRates['BTC-USD'] = {
        value: btcUsdt.value,
        lastUpdate: btcUsdt.lastUpdate,
        change24h: btcUsdt.change24h
      };
    }

    const wldUsdt = getFormattedPrice('WLDUSDT');
    if (wldUsdt) {
      newRates['WLD-USD'] = {
        value: wldUsdt.value - 0.50,
        lastUpdate: wldUsdt.lastUpdate,
        change24h: wldUsdt.change24h
      };
    }

    setRates(newRates);
  }, [prices, getFormattedPrice]);

  useEffect(() => {
    updateRates();
  }, [updateRates]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tipos de Cambio</h1>
        
        {/* Panel de Tasas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {exchangeOptions.map((option) => {
            const rate = rates[option.id];
            const isCurrentSymbol = false;
            
            return (
              <div 
                key={option.id}
                className={`p-4 rounded-xl backdrop-blur-md transition-all duration-500 ${
                  isCurrentSymbol ? 'scale-105 shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: COLORS.card,
                  boxShadow: COLORS.shadow,
                  opacity: isCurrentSymbol ? 1 : 0.8
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <option.icon className="h-6 w-6" style={{ color: COLORS.primary }} />
                    <span className="ml-2 font-medium" style={{ color: COLORS.text }}>
                      {option.label}
                    </span>
                  </div>
                  <TrendIndicator rate={rate} />
                </div>
                <div>
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>
                    {option.name}
                  </span>
                  <div className="text-2xl font-bold mt-1" style={{ color: COLORS.text }}>
                    {rate?.value ? rate.value.toFixed(2) : 'Cargando...'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                    Actualizado: {rate?.lastUpdate ? <TimeDisplay date={rate.lastUpdate} /> : 'N/A'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de Conversión */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Convertidor</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {exchangeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                  selectedOption === option.id 
                    ? 'bg-[#8B4513] text-white' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <option.icon className="h-5 w-5" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <ExchangePanel
            selectedOption={selectedOption}
            rates={rates}
            amount={amount}
            setAmount={setAmount}
            debouncedAmount={debouncedAmount}
            className="bg-white rounded-xl shadow-lg p-8"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExchangePage;
