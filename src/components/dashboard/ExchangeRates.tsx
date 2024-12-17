'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Bitcoin, Coins, ExternalLink } from 'lucide-react';
import { 
  ArgentinaFlag, 
  BrazilFlag, 
  BitcoinFlag, 
  WorldcoinFlag, 
  PixFlag 
} from '@/components/icons/Flags';

interface BinancePrice {
  symbol: string;
  price: string;
}

async function fetchBinancePrices() {
  try {
    const [wldPrice, brlPrice, arsPrice] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTARS')
    ]);

    const [wldData, brlData, arsData] = await Promise.all([
      wldPrice.json(),
      brlPrice.json(),
      arsPrice.json()
    ]);

    return {
      wld: parseFloat(wldData.price),
      brl: parseFloat(brlData.price),
      ars: parseFloat(arsData.price)
    };
  } catch (error) {
    console.error('Error fetching Binance prices:', error);
    return null;
  }
}

export default function ExchangeRates() {
  const [prices, setPrices] = useState({
    wld: 0,
    brl: 0,
    ars: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updatePrices = async () => {
      const newPrices = await fetchBinancePrices();
      if (newPrices) {
        setPrices(newPrices);
        setLoading(false);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const exchangeServices = [
    {
      name: "Peso Argentino (ARS)",
      rate: loading ? "Cargando..." : `1 USD = ${prices.ars.toFixed(2)} ARS`,
      icon: DollarSign,
      flag: ArgentinaFlag,
      lastUpdate: "Actualización en tiempo real",
      binanceUrl: "https://www.binance.com/es-AR/trade/USDT_ARS?type=spot"
    },
    {
      name: "Real Brasileño (BRL)",
      rate: loading ? "Cargando..." : `1 USD = ${prices.brl.toFixed(2)} BRL`,
      icon: DollarSign,
      flag: BrazilFlag,
      lastUpdate: "Actualización en tiempo real",
      binanceUrl: "https://www.binance.com/en/trade/USDT_BRL?type=spot"
    },
    {
      name: "PIX",
      rate: "Transferencia instantánea",
      icon: Coins,
      flag: PixFlag,
      lastUpdate: "Sistema operativo"
    },
    {
      name: "Worldcoin (WLD)",
      rate: loading ? "Cargando..." : `1 WLD = ${prices.wld.toFixed(2)} USD`,
      icon: Coins,
      flag: WorldcoinFlag,
      lastUpdate: "Actualización en tiempo real",
      binanceUrl: "https://www.binance.com/es-AR/trade/WLD_USDT?type=spot"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exchangeServices.map((service, index) => {
        const Flag = service.flag;
        return (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8">
                <Flag />
              </div>
              <h4 className="font-semibold text-gray-200">{service.name}</h4>
              {service.binanceUrl && (
                <a 
                  href={service.binanceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-auto text-[#722F37] hover:text-[#722F37]/80"
                  title="Ver en Binance"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-100">{service.rate}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{service.lastUpdate}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
