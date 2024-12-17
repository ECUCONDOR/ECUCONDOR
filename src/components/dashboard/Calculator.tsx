'use client';

import { useState, useEffect } from 'react';
import { fetchPrices } from '@/services/binance';

type Operation = {
  id: string;
  name: string;
  commission: number;
  type: 'buy' | 'sell';
  pair: string;
  baseSymbol: string;
  quoteSymbol: string;
};

const operations: Operation[] = [
  {
    id: 'buy_ars',
    name: 'Comprar Pesos Argentinos (ARS)',
    commission: -0.04, // -4%
    type: 'buy',
    pair: 'USDTARS',
    baseSymbol: 'USD',
    quoteSymbol: 'ARS'
  },
  {
    id: 'sell_wld',
    name: 'Vender Worldcoin (WLD)',
    commission: -0.15, // -15%
    type: 'sell',
    pair: 'WLDUSDT',
    baseSymbol: 'WLD',
    quoteSymbol: 'USD'
  },
  {
    id: 'buy_brl',
    name: 'Comprar Reales (BRL)',
    commission: 0.10, // +10%
    type: 'buy',
    pair: 'USDTBRL',
    baseSymbol: 'USD',
    quoteSymbol: 'BRL'
  }
];

export default function Calculator() {
  const [selectedOperation, setSelectedOperation] = useState<Operation>(operations[0]);
  const [amount, setAmount] = useState<string>('');
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const updateRates = async () => {
      try {
        const prices = await fetchPrices();
        setRates(prices);
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };

    // Initial fetch
    updateRates();

    // Update every 30 seconds
    const interval = setInterval(updateRates, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateResult();
  }, [amount, selectedOperation, rates]);

  const calculateResult = () => {
    if (!amount || !rates[selectedOperation.pair]) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    const rate = rates[selectedOperation.pair];
    let calculatedResult: number;

    if (selectedOperation.type === 'buy') {
      if (selectedOperation.commission < 0) {
        // For ARS: If buying 100 USD, receive ARS value minus 4%
        calculatedResult = numericAmount * rate * (1 + selectedOperation.commission);
      } else {
        // For BRL: If buying 100 BRL, need to send USD value plus 10%
        calculatedResult = (numericAmount / rate) * (1 + selectedOperation.commission);
      }
    } else {
      // For WLD: If selling 10 WLD, receive USD value minus 15%
      calculatedResult = numericAmount * rate * (1 + selectedOperation.commission);
    }

    const formattedResult = calculatedResult.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const resultText = selectedOperation.type === 'buy' && selectedOperation.commission > 0
      ? `Enviar ${selectedOperation.baseSymbol} ${formattedResult}`
      : `Recibir ${selectedOperation.quoteSymbol} ${formattedResult}`;

    setResult(resultText);
  };

  return (
    <div className="space-y-4">
      <select
        value={selectedOperation.id}
        onChange={(e) => {
          const operation = operations.find(op => op.id === e.target.value);
          if (operation) setSelectedOperation(operation);
        }}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
      >
        {operations.map((op) => (
          <option key={op.id} value={op.id}>
            {op.name}
          </option>
        ))}
      </select>

      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Ingrese monto en ${selectedOperation.type === 'sell' ? selectedOperation.baseSymbol : selectedOperation.quoteSymbol}`}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {selectedOperation.type === 'sell' ? selectedOperation.baseSymbol : selectedOperation.quoteSymbol}
        </span>
      </div>

      {rates[selectedOperation.pair] && (
        <div className="text-sm text-gray-400">
          Tasa: 1 {selectedOperation.baseSymbol} = {rates[selectedOperation.pair].toFixed(2)} {selectedOperation.quoteSymbol}
        </div>
      )}

      {result && (
        <div className="text-lg font-semibold text-white">
          {result}
        </div>
      )}
    </div>
  );
}
