'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import TrendIndicator from '@/components/TrendIndicator';
import { COLORS } from '@/constants/colors';
import { exchangeOptions, initialRates } from '@/constants/exchangeOptions';
import type { ExchangePair, ExchangeRate, ExchangeOption } from '@/types/exchange';
import { formatTime } from '@/utils/timeUtils';
import dynamic from 'next/dynamic';
import Icon from '@/components/ui/icon';
import { PublicNavbar } from '@/components/public-navbar';
import { Shield, Bolt, Globe } from 'lucide-react';
import NewYearFireworks from '@/components/NewYearFireworks';

// Create a client-only TimeDisplay component
const TimeDisplay = dynamic(() => Promise.resolve(({ date }: { date: Date }) => (
  <span>{formatTime(date)}</span>
)), { ssr: false });

export default function Home() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [rates, setRates] = useState<Record<ExchangePair, ExchangeRate>>(initialRates);
  const binancePairs = ['btcusdt', 'wldusdt', 'usdtbrl', 'usdtars'];
  const { prices, error } = useBinanceWebSocket(exchangeOptions.map(opt => opt.symbol));
  const [selectedExchange, setSelectedExchange] = useState(exchangeOptions[0]);
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSymbolIndex((prevIndex) => (prevIndex + 1) % exchangeOptions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExchangeSelect = (exchange: ExchangeOption) => {
    setSelectedExchange(exchange);
    setAmount('');
    setConvertedAmount('');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const rate = rates[selectedExchange.pair]?.rate || 1;
      setConvertedAmount((numericValue * rate).toFixed(2));
    } else {
      setConvertedAmount('');
    }
  };

  useEffect(() => {
    if (prices) {
      const newRates: Record<ExchangePair, ExchangeRate> = { ...rates };
      prices.forEach((priceData) => {
        const option = exchangeOptions.find(opt => opt.symbol.toLowerCase() === priceData.symbol.toLowerCase());
        if (option) {
          newRates[option.pair] = {
            rate: priceData.price,
            lastUpdate: priceData.lastUpdate,
          };
        }
      });
      setRates(newRates);
      setLastUpdate(new Date());
    }
  }, [prices]);

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
                const rate = rates[option.pair]?.rate;
                const isActive = index === currentSymbolIndex;
                return (
                  <div
                    key={option.pair}
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
                        <TrendIndicator rate={rates[selectedExchange.pair]} />
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
              title: 'Seguro',
              description: 'Transacciones protegidas con la última tecnología en seguridad',
              icon: Shield,
            },
            {
              title: 'Rápido',
              description: 'Transferencias instantáneas entre diferentes monedas',
              icon: Bolt,
            },
            {
              title: 'Global',
              description: 'Conectamos personas y negocios en todo el mundo',
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
      </div>
    </main>
  );
}
