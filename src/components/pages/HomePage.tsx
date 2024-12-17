'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Navbar } from '@/components/ui/Navbar';

interface ChampagneGlassProps {
  style: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

// Componente de copa de champagne optimizado
const ChampagneGlass = memo(({ style }: ChampagneGlassProps) => (
  <div
    className="absolute w-18 h-18 text-yellow-300/60 animate-float"
    style={style}
  >
    🥂
  </div>
));

ChampagneGlass.displayName = 'ChampagneGlass';

export default function HomePage() {
  const [showNewYear, setShowNewYear] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const backgroundImageUrl = '/images/background.jpg';

  // Generar copos de nieve
  const renderSnowflakes = useCallback(() => {
    return Array.from({ length: 50 }).map((_, index: number) => (
      <div
        key={index}
        className="absolute animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}%`,
          fontSize: `${Math.random() * 20 + 10}px`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * 3}s`,
          opacity: Math.random() * 0.6 + 0.4,
        }}
      >
        ❄
      </div>
    ));
  }, []);

  // Cargar imagen de fondo
  useEffect(() => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      if (!imageLoaded) {
        setImageLoaded(true); // Mostrar el fondo alternativo
      }
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImageLoaded(true);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      setImageLoaded(true); // Mostrar el fondo alternativo
      // Aplicar un fondo degradado como fallback
      document.body.style.background = 
        "radial-gradient(circle at center, #722F37 0%, #2a0f12 100%)";
    };

    img.src = backgroundImageUrl;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [backgroundImageUrl, imageLoaded]);

  // Alternar entre mensajes
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNewYear(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <main className="pt-16">
        {/* Fondo con overlay */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${backgroundImageUrl}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#2a0f12' // Color de fondo como fallback
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>

        {/* Efecto de nieve */}
        <div className="absolute inset-0 pointer-events-none">
          {renderSnowflakes()}
        </div>

        {/* Copas de champagne */}
        {[
          { top: '20%', left: '15%' },
          { top: '30%', right: '15%' },
          { bottom: '25%', left: '20%' },
          { bottom: '35%', right: '20%' }
        ].map((style, index) => (
          <ChampagneGlass key={index} style={style} />
        ))}

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="backdrop-blur-sm bg-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="relative h-32">
              <h1 
                className={`absolute w-full text-5xl md:text-7xl font-bold text-white mb-4 text-shadow-xl transition-all duration-500 ${
                  showNewYear ? 'opacity-0 transform -translate-y-4' : 'opacity-100'
                }`}
              >
                ¡Feliz Navidad!
              </h1>
              <h1 
                className={`absolute w-full text-5xl md:text-7xl font-bold text-white mb-4 text-shadow-xl transition-all duration-500 ${
                  showNewYear ? 'opacity-100' : 'opacity-0 transform translate-y-4'
                }`}
              >
                ¡Feliz 2025!
              </h1>
            </div>
            <p className="text-2xl text-white/90 mt-4 mb-8">
              Bienvenidos a ECUCONDOR S.A.S
            </p>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl text-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Comenzar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
