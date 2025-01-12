'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import TrendIndicator from '@/components/TrendIndicator';
import { COLORS } from '@/contexts/constants/colors';
import { exchangeOptions as initialExchangeOptions, initialRates } from '@/contexts/constants/exchangeOptions';
import type { ExchangePair, ExchangeRate } from '@/types/exchange';
import type { ExchangeOption } from '@/types/exchange';
import { formatTime } from '@/utils/timeUtils';
import dynamic from 'next/dynamic';
import Icon from '@/components/ui/icon';
import { PublicNavbar } from '@/components/public-navbar';
import { Shield, Zap, Globe, MessageSquare } from 'lucide-react';
import NewYearFireworks from '@/components/NewYearFireworks';

interface BinancePrice {
  symbol: string;
  price: string;
  lastUpdate?: Date;
}

interface ExtendedExchangeOption extends ExchangeOption {
  price?: number;
  lastUpdate?: Date;
}

// Create a client-only TimeDisplay component
const TimeDisplay = dynamic(() => Promise.resolve(({ date }: { date: Date }) => (
  <span>{formatTime(date)}</span>
)), { ssr: false });

export default function Home() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [rates, setRates] = useState<Record<ExchangePair, ExchangeRate>>(initialRates);
  const binancePairs = ['btcusdt', 'wldusdt', 'usdtbrl', 'usdtars'];
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);
  const currentSymbol = useMemo(
    () => initialExchangeOptions[currentSymbolIndex],
    [currentSymbolIndex]
  );
  const { prices, error } = useBinanceWebSocket([currentSymbol.symbol]);
  const [exchangeOptions, setExchangeOptions] = useState<ExtendedExchangeOption[]>(
    initialExchangeOptions.map(opt => ({
      ...opt,
      price: undefined,
      lastUpdate: undefined
    }))
  );
  const [selectedExchange, setSelectedExchange] = useState<ExtendedExchangeOption>(exchangeOptions[0]);
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error connecting to Binance",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (prices) {
      prices.forEach((priceData: BinancePrice) => {
        const option = exchangeOptions.find(opt => opt.symbol === priceData.symbol);
        if (option) {
          option.price = parseFloat(priceData.price);
          option.lastUpdate = priceData.lastUpdate || new Date();
        }
      });
    }
  }, [prices, exchangeOptions]);

  const rotateSymbol = useCallback(() => {
    setCurrentSymbolIndex(prevIndex => (prevIndex + 1) % initialExchangeOptions.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotateSymbol, 5000);
    return () => clearInterval(interval);
  }, [rotateSymbol]);

  const handleExchangeSelect = (exchange: ExtendedExchangeOption) => {
    setSelectedExchange(exchange);
    setAmount('');
    setConvertedAmount('');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const rate = selectedExchange.id in rates ? rates[selectedExchange.id].value : 1;
      setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
    } else {
      setConvertedAmount('');
    }
  }, [amount, selectedExchange, rates]);

  useEffect(() => {
    if (prices) {
      const newRates: Record<ExchangePair, ExchangeRate> = { ...rates };
      prices.forEach((priceData: BinancePrice) => {
        const option = exchangeOptions.find(opt => opt.symbol.toLowerCase() === priceData.symbol.toLowerCase());
        if (option && option.id) {
          newRates[option.id as ExchangePair] = {
            value: parseFloat(priceData.price),
            lastUpdate: priceData.lastUpdate || new Date(),
            change24h: 0, // You might want to calculate this value properly
          };
        }
      });
      const binancePrice = prices.find(p => p.symbol === 'BTCUSDT');
      if (binancePrice) {
        newRates['BTC-USD'] = {
          value: parseFloat(binancePrice.price),
          lastUpdate: new Date(),
          change24h: 0
        };
      }
      setRates(newRates);
      setLastUpdate(new Date());
    }
  }, [prices]);

  const formattedPrice = useMemo(() => {
    if (!prices?.find(p => p.symbol === currentSymbol.symbol)?.p) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(prices.find(p => p.symbol === currentSymbol.symbol)?.p));
  }, [prices, currentSymbol]);
  
  const whatsappNumber = '+593999999999'; // Replace with your WhatsApp number
  const pixKey = 'your_pix_key'; // Replace with your PIX key

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

    const handlePixClick = () => {
        // Here you would typically open a modal or redirect to a payment page
        // For now, we'll just show an alert
        alert(`PIX Key: ${pixKey}\n\nCopy this key to make a payment.`);
    };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <NewYearFireworks />
      </div>
      <PublicNavbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Hero Section */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Bienvenido a <span className="bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text font-extrabold">EcuCondor</span>
            </h1>
            <p className="text-xl text-gray-300 font-light leading-relaxed">
              La plataforma más segura para tus transacciones internacionales
            </p>
            
            {!user && (
              <div className="flex flex-col space-y-4">
                <Input
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 backdrop-blur-sm"
                />
                <Button
                  onClick={() => router.push('/auth/register')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105"
                >
                  Comenzar Ahora
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Exchange Rates */}
          <div className="bg-white/5 rounded-lg p-6 backdrop-blur-md border border-white/10">
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
              Tasas de Cambio en Vivo
            </h2>
            <div className="space-y-4">
              {exchangeOptions.map((option, index) => {
                const rate = rates[option.id as ExchangePair]?.value;
                const isActive = index === currentSymbolIndex;
                return (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-blue-500/20 scale-105' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon icon={option.icon} className="w-6 h-6" />
                        <span>{option.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-semibold">
                          {rate ? rate.toFixed(2) : '-'}
                        </span>
                        <TrendIndicator rate={rates[option.id as ExchangePair]} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-400 mt-4 text-right">
                Última actualización: <TimeDisplay date={lastUpdate} />
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Seguridad Garantizada',
              description: 'Operaciones protegidas con los más altos estándares de seguridad bancaria',
              icon: Shield,
            },
            {
              title: 'Servicio Personalizado',
              description: 'Atención dedicada y asesoramiento financiero especializado',
              icon: Zap,
            },
            {
              title: 'Alcance Internacional',
              description: 'Presencia en múltiples países con soporte local',
              icon: Globe,
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
              <Icon icon={feature.icon} className="w-12 h-12 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
        
          {/* Payment Options */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">¿Necesitas Ayuda?</h3>
              <p className="text-gray-300 mb-4">
                Comunícate con nosotros a través de WhatsApp para obtener soporte personalizado.
              </p>
                <Button onClick={handleWhatsAppClick} className="bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5"/>
                    <span>Chatea con nosotros</span>
                </Button>
            </div>
          
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Opciones de Pago</h3>
            <p className="text-gray-300 mb-4">
                Facilitamos tus transacciones con opciones de pago locales.
            </p>
            <div className="space-y-2">
              <Button onClick={handlePixClick} className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105">
                Pagar con PIX (Brasil)
              </Button>
            </div>
          </div>
          
        </div>

        {/* Footer con Derechos Reservados y Enlaces */}
        <footer className="mt-16 border-t border-white/10 pt-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">EcuCondor S.A.S</h4>
              <p className="text-sm text-gray-300">
                © 2024 EcuCondor. Todos los derechos reservados.<br/>
                Registro Nacional de Bases de Datos N° 0000000
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Importantes</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-gray-300 hover:text-white">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="text-sm text-gray-300 hover:text-white">
                    Cumplimiento Normativo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Información Legal</h4>
              <p className="text-sm text-gray-300">
                EcuCondor S.A.S está regulada por la Superintendencia Financiera.<br/>
                NIT: 000000000-0
              </p>
            </div>
          </div>
        </footer>
      </div>
      {/* Eliminamos el div fijo del footer que muestra las tasas rotativas */}
    </main>
  );
}