import React, { useEffect, useState } from 'react';
import FestiveLogo from './FestiveLogo';
import { Star, Snowflake, Gift } from 'lucide-react';
import FallingIcon from './FallingIcon';

const ChristmasLanding = () => {
  const [snowflakes, setSnowflakes] = useState([]);
  const [icons, setIcons] = useState([]);
  const [lights, setLights] = useState([]);

  useEffect(() => {
    const createSnowflakes = () => {
      return Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 15 + 10,
        duration: Math.random() * 5 + 10,
        delay: Math.random() * 5
      }));
    };

    const createIcons = () => {
      return Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 5 + 10,
        delay: Math.random() * 5
      }));
    };

    const createLights = () => {
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i % 4],
        delay: i * 0.2
      }));
    };

    setSnowflakes(createSnowflakes());
    setIcons(createIcons());
    setLights(createLights());
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 via-red-950 to-gray-950">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(139,0,0,0.2),transparent_70%)]" />

      {/* Snowflakes */}
      {snowflakes.map((snowflake) => (
        <div
          key={snowflake.id}
          className="absolute text-white opacity-70"
          style={{
            left: snowflake.left,
            top: '-20px',
            fontSize: `${snowflake.size}px`,
            animation: `fall ${snowflake.duration}s linear infinite`,
            animationDelay: `${snowflake.delay}s`
          }}
        >
          ❄
        </div>
      ))}

      {/* Falling Icons */}
      {icons.map((icon) => (
        <FallingIcon key={icon.id} left={icon.left} duration={icon.duration} delay={icon.delay} />
      ))}

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 select-none">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6">
          <FestiveLogo />
          <div className="flex items-center space-x-8">
            <button className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-white to-green-300 hover:from-red-400 hover:to-green-400 transition-all">
              Inicio
            </button>
            <button className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-white to-red-300 hover:from-green-400 hover:to-red-400 transition-all">
              Servicios
            </button>
            <button className="text-lg font-semibold bg-gradient-to-r from-red-600 to-green-600 px-6 py-2 rounded-full text-white hover:from-red-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl">
              Conectar
            </button>
          </div>
        </nav>

        {/* Hero section */}
        <div className="mt-20 text-center">
          <h1 className="text-6xl font-bold mb-6">
            <span className="block bg-gradient-to-r from-red-300 via-white to-green-300 text-transparent bg-clip-text animate-gradient">
              Conectando Talentos
            </span>
            <span className="block mt-2 bg-gradient-to-r from-green-300 via-white to-red-300 text-transparent bg-clip-text animate-gradient-reverse">
              Entre Fronteras
            </span>
            <p className="mt-4 text-xl text-white">
              Facilitando pagos entre Ecuador y Argentina
            </p>
          </h1>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ChristmasLanding;
