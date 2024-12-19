import React, { useState, useEffect } from 'react';
import { binanceService } from '../services/binanceService';

interface ExchangeRates {
  [key: string]: number;
}

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [fromCurrency, setFromCurrency] = useState<string>('USDT');
  const [toCurrency, setToCurrency] = useState<string>('ARS');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      const newRates = await binanceService.getMultipleRates();
      setRates(newRates);
    } catch (err) {
      setError('Error al obtener las tasas de cambio');
    }
  };

  const handleConvert = async () => {
    setError(null);
    setLoading(true);
    try {
      let convertedAmount: number;
      const pair = `${fromCurrency}${toCurrency}`;
      
      if (rates[pair]) {
        convertedAmount = amount * rates[pair];
      } else {
        // Si no existe la conversión directa, usar USDT como intermediario
        const fromRate = rates[`${fromCurrency}USDT`] || 1 / rates[`USDT${fromCurrency}`];
        const toRate = rates[`USDT${toCurrency}`];
        convertedAmount = amount * fromRate * toRate;
      }
      
      setResult(convertedAmount);
    } catch (err) {
      setError('Error en la conversión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gold rounded-lg bg-black bg-opacity-30">
      <h2 className="text-3xl font-bold mb-6 text-gold">Convertir Divisas</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Cantidad</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
            placeholder="Ingrese el monto"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">De</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
            >
              <option value="USDT">USDT</option>
              <option value="ARS">ARS</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">A</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
            >
              <option value="ARS">ARS</option>
              <option value="BRL">BRL</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
        >
          {loading ? 'Convirtiendo...' : 'Convertir'}
        </button>

        {result !== null && (
          <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-lg">
            <h3 className="text-xl font-semibold">Resultado:</h3>
            <p className="text-2xl text-gold">
              {result.toFixed(2)} {toCurrency}
            </p>
            <p className="text-sm text-gray-400">
              Tasa: 1 {fromCurrency} = {(result / amount).toFixed(4)} {toCurrency}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500 bg-opacity-10 text-red-500 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
