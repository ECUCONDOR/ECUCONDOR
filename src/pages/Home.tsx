import React from 'react';
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
      </div>
    </div>
  );
};

export default Home;
