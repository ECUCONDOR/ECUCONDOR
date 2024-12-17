import React, { useState, useEffect } from 'react';
import { DollarSign, Bitcoin, Coins } from 'lucide-react';
import { BinanceService } from '../services/binanceService';

// Colores corporativos (importados del tema principal)
const COLORS = {
  primary: {
    main: '#722F37',
    light: '#8B3B44',
    dark: '#5A252C'
  },
  background: {
    main: '#1A1A1A',
    light: '#2D2D2D',
    card: '#333333'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    muted: '#A0A0A0'
  }
};

interface ExchangeRate {
  pair: string;
  rate: number;
  change24h: number;
}

export const CurrencyExchangePanel: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([
    { pair: 'USD/ARS', rate: 1315.00, change24h: 0.5 },
    { pair: 'BRL/ARS', rate: 270.00, change24h: -0.3 },
    { pair: 'USD/BRL', rate: 4.87, change24h: 0.2 }
  ]);
  const [selectedPair, setSelectedPair] = useState('USD/ARS');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => prev.map(rate => ({
        ...rate,
        rate: Number((rate.rate + (Math.random() - 0.5) * 2).toFixed(2)),
        change24h: Number((rate.change24h + (Math.random() - 0.5)).toFixed(2))
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleExchange = async () => {
    if (!amount) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setAmount('');
  };

  const currentRate = rates.find(r => r.pair === selectedPair)?.rate || 0;

  return (
    <div className="bg-opacity-10 rounded-xl p-6 shadow-xl mb-6"
      style={{ backgroundColor: COLORS.background.card }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
        Cambio de Divisas
      </h2>

      {/* Selector de par de divisas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {rates.map((rate) => (
          <button
            key={rate.pair}
            onClick={() => setSelectedPair(rate.pair)}
            className="p-4 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: selectedPair === rate.pair ? COLORS.primary.main : COLORS.background.light,
              color: COLORS.text.primary
            }}
          >
            <div className="text-lg font-bold">{rate.pair}</div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              {rate.rate.toFixed(2)}
            </div>
            <div className={`text-xs ${rate.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {rate.change24h >= 0 ? '+' : ''}{rate.change24h}%
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2" style={{ color: COLORS.text.secondary }}>
            Cantidad a cambiar
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: COLORS.text.secondary }}>
              {selectedPair.split('/')[0]}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 pl-12 rounded-lg"
              style={{
                backgroundColor: COLORS.background.light,
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.primary.light}`
              }}
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2" style={{ color: COLORS.text.secondary }}>
            Cantidad a recibir
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: COLORS.text.secondary }}>
              {selectedPair.split('/')[1]}
            </span>
            <div className="w-full p-3 pl-12 rounded-lg"
              style={{
                backgroundColor: COLORS.background.light,
                color: COLORS.text.primary
              }}>
              {amount ? (Number(amount) * currentRate).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleExchange}
        disabled={isProcessing || !amount}
        className="w-full p-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          backgroundColor: COLORS.primary.main,
          color: COLORS.text.primary,
          opacity: isProcessing || !amount ? 0.7 : 1
        }}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"/>
        ) : (
          <>
            <DollarSign className="h-5 w-5" />
            <span>Realizar Cambio</span>
          </>
        )}
      </button>
    </div>
  );
};

type CryptoSymbol = 'BTCUSDT' | 'WLDUSDT';
type CryptoRates = {
  [K in CryptoSymbol]: {
    price: number;
    change24h: number;
  };
};

export const CryptoExchangePanel: React.FC = () => {
  const [cryptoRates, setCryptoRates] = useState<CryptoRates>({
    'BTCUSDT': { price: 0, change24h: 0 },
    'WLDUSDT': { price: 0, change24h: 0 }
  });
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSymbol>('BTCUSDT');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const binanceService = BinanceService.getInstance();
    let intervalId: NodeJS.Timeout;

    const updatePrices = async () => {
      try {
        const prices = await binanceService.getPrices(['BTCUSDT', 'WLDUSDT']);
        setCryptoRates(prev => ({
          'BTCUSDT': {
            price: prices.get('BTCUSDT') || prev['BTCUSDT'].price,
            change24h: prev['BTCUSDT'].change24h
          },
          'WLDUSDT': {
            price: prices.get('WLDUSDT') || prev['WLDUSDT'].price,
            change24h: prev['WLDUSDT'].change24h
          }
        }));
      } catch (error) {
        console.error('Error updating crypto prices:', error);
      }
    };

    // Actualizar precios inmediatamente y luego cada 15 segundos
    updatePrices();
    intervalId = setInterval(updatePrices, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCryptoExchange = async () => {
    if (!amount) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setAmount('');
  };

  return (
    <div className="bg-opacity-10 rounded-xl p-6 shadow-xl"
      style={{ backgroundColor: COLORS.background.card }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
        Compra de Criptomonedas
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {(Object.entries(cryptoRates) as [CryptoSymbol, { price: number; change24h: number }][]).map(([pair, data]) => (
          <button
            key={pair}
            onClick={() => setSelectedCrypto(pair)}
            className="p-4 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: selectedCrypto === pair ? COLORS.primary.main : COLORS.background.light,
              color: COLORS.text.primary
            }}
          >
            <div className="flex items-center gap-2">
              {pair.startsWith('BTC') ? <Bitcoin className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
              <span className="text-lg font-bold">{pair}</span>
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              ${data.price.toFixed(2)}
            </div>
            <div className={`text-xs ${data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.change24h >= 0 ? '+' : ''}{data.change24h}%
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2" style={{ color: COLORS.text.secondary }}>
            USD a invertir
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: COLORS.text.secondary }}>
              USD
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 pl-12 rounded-lg"
              style={{
                backgroundColor: COLORS.background.light,
                color: COLORS.text.primary,
                border: `1px solid ${COLORS.primary.light}`
              }}
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2" style={{ color: COLORS.text.secondary }}>
            Crypto a recibir
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: COLORS.text.secondary }}>
              {selectedCrypto.split('/')[0]}
            </span>
            <div className="w-full p-3 pl-12 rounded-lg"
              style={{
                backgroundColor: COLORS.background.light,
                color: COLORS.text.primary
              }}>
              {amount ? (Number(amount) / cryptoRates[selectedCrypto].price).toFixed(8) : '0.00000000'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCryptoExchange}
        disabled={isProcessing || !amount}
        className="w-full p-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          backgroundColor: COLORS.primary.main,
          color: COLORS.text.primary,
          opacity: isProcessing || !amount ? 0.7 : 1
        }}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"/>
        ) : (
          <>
            <Bitcoin className="h-5 w-5" />
            <span>Comprar Crypto</span>
          </>
        )}
      </button>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.background.light }}>
          <h4 className="font-medium mb-2" style={{ color: COLORS.text.primary }}>
            Comisión
          </h4>
          <p style={{ color: COLORS.text.secondary }}>
            0.1% por operación
          </p>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.background.light }}>
          <h4 className="font-medium mb-2" style={{ color: COLORS.text.primary }}>
            Tiempo estimado
          </h4>
          <p style={{ color: COLORS.text.secondary }}>
            1-2 minutos
          </p>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.background.light }}>
          <h4 className="font-medium mb-2" style={{ color: COLORS.text.primary }}>
            Límite diario
          </h4>
          <p style={{ color: COLORS.text.secondary }}>
            $50,000 USD
          </p>
        </div>
      </div>
    </div>
  );
};
