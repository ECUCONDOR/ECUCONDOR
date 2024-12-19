import React from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2B2730] to-[#413543] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#FFC436] sm:text-5xl md:text-6xl">
            Bienvenido a ECUCONDOR
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-[#FFC436]/80 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Tu plataforma financiera de confianza para transacciones internacionales
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative group">
              <div className="relative bg-[#2B2730]/30 backdrop-blur-md rounded-lg px-6 py-5 shadow-lg border border-[#FFC436]/20 hover:border-[#FFC436]/40 transition-all duration-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FFC436]/10 text-[#FFC436] mx-auto">
                  <img src="/images/transaction.svg" alt="Transacciones" className="h-6 w-6" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-[#FFC436] text-center">Transacciones Internacionales</h3>
                  <p className="mt-2 text-base text-[#FFC436]/70 text-center">
                    Ecuador · Argentina · Brasil
                  </p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="relative bg-[#2B2730]/30 backdrop-blur-md rounded-lg px-6 py-5 shadow-lg border border-[#FFC436]/20 hover:border-[#FFC436]/40 transition-all duration-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FFC436]/10 text-[#FFC436] mx-auto">
                  <img src="/images/exchange.svg" alt="Mercado WLD" className="h-6 w-6" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-[#FFC436] text-center">Mercado WLD</h3>
                  <p className="mt-2 text-base text-[#FFC436]/70 text-center">
                    Tasas Competitivas
                  </p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="relative bg-[#2B2730]/30 backdrop-blur-md rounded-lg px-6 py-5 shadow-lg border border-[#FFC436]/20 hover:border-[#FFC436]/40 transition-all duration-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FFC436]/10 text-[#FFC436] mx-auto">
                  <img src="/images/service.svg" alt="Servicio Premium" className="h-6 w-6" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-[#FFC436] text-center">Servicio Premium</h3>
                  <p className="mt-2 text-base text-[#FFC436]/70 text-center">
                    Atención Personalizada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center space-x-6">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#2B2730] bg-[#FFC436] hover:bg-[#FFB000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC436] transition-colors duration-200"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center px-6 py-3 border border-[#FFC436] text-base font-medium rounded-md text-[#FFC436] hover:bg-[#FFC436]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC436] transition-colors duration-200"
          >
            Registrarse
          </button>
        </div>
=======
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navbar />

      <main className="container mx-auto px-4 pt-20 text-center relative z-10">
        <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-green-300">
          Conectando Talentos<br />Entre Fronteras
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Facilitando pagos entre Ecuador y Argentina
        </p>
        
        <button
          onClick={() => navigate('/login')}
          className="text-xl font-semibold bg-gradient-to-r from-red-600 to-green-600 px-8 py-3 rounded-full text-white hover:from-red-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
        >
          Comenzar Ahora
        </button>
      </main>

      {/* Animación de copos de nieve */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          >
            ❄️
          </div>
        ))}
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
      </div>
    </div>
  );
};

export default Home;
