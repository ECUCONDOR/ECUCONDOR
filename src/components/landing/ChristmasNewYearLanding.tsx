'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';

// Componente de copa de champagne optimizado
const ChampagneGlass = memo(({ style }: { style: React.CSSProperties }) => (
  <div className="absolute animate-float" style={style}>
    <div className="w-6 h-12 border-2 border-white/60 rounded-b-full relative">
      <div className="w-4 h-4 bg-yellow-200/40 absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full animate-bubble" />
    </div>
    <div className="w-3 h-6 bg-white/60 mt-1 mx-auto" />
    <div className="w-8 h-2 bg-white/60 rounded-full mt-1 mx-auto" />
  </div>
));

ChampagneGlass.displayName = 'ChampagneGlass';

const ChristmasNewYearLanding: React.FC = () => {
  // Estados
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showNewYear, setShowNewYear] = useState(false);

  // URL del fondo con gradiente festivo
  const backgroundImageUrl = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:#722F37;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#2a0f12;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `)}`;

  // Función optimizada para generar copos de nieve
  const generateSnowflake = useCallback((index: number) => {
    const isGolden = index % 5 === 0;
    return {
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20}%`,
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
      backgroundColor: isGolden ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
      animationDuration: `${Math.random() * 6 + 4}s`,
      animationDelay: `${Math.random() * 4}s`,
      opacity: Math.random() * 0.4 + 0.6,
    };
  }, []);

  // Efecto para alternar mensajes festivos
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNewYear(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para cargar imagen con manejo de errores mejorado
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
      setImageLoaded(true);
      // Aplicar un fondo degradado como fallback
      document.body.style.background = 
        "radial-gradient(circle at center, #722F37 0%, #2a0f12 100%)";
    };

    img.src = backgroundImageUrl;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
      // Limpiar el estilo del fondo al desmontar
      document.body.style.background = '';
    };
  }, [backgroundImageUrl]);

  // Renderizado de copos de nieve
  const renderSnowflakes = useCallback(() => {
    return [...Array(150)].map((_, i) => (
      <div
        key={i}
        className="animate-fall absolute rounded-full blur-[0.5px]"
        style={generateSnowflake(i)}
      />
    ));
  }, [generateSnowflake]);

  return (
    <div className="min-h-screen relative overflow-hidden">
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
                showNewYear ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
              }`}
            >
              ¡Feliz Navidad!
            </h1>
            <h1 
              className={`absolute w-full text-5xl md:text-7xl font-bold text-white text-shadow-xl transition-all duration-500 ${
                showNewYear ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
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
            onClick={() => {
              // Aquí puedes agregar la lógica de navegación
              console.log('Navegando...');
            }}
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos globales para las animaciones
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      0% { 
        transform: translateY(-10px) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% { 
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
    
    .animate-fall {
      animation: fall linear infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    
    @keyframes bubble {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
      50% { transform: translateY(-5px) scale(1.1); opacity: 0.8; }
    }
    
    .animate-bubble {
      animation: bubble 2s ease-in-out infinite;
    }
    
    .text-shadow-xl {
      text-shadow: 
        0 2px 4px rgba(0,0,0,0.3),
        0 4px 8px rgba(0,0,0,0.2),
        0 8px 16px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);
}

export default ChristmasNewYearLanding;
