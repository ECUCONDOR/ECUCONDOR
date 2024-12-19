<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthError } from '../lib/supabaseClient';
import { toast } from 'react-toastify';
import NewYearCountdown from '../components/NewYearCountdown';
import '../styles/NewYear.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Add sparkle elements
    const container = document.querySelector('.new-year-background');
    if (container) {
      for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(sparkle);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.signIn({ email, password });
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error al iniciar sesión');
=======
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/exchange');
    } catch (error) {
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Login error:', error);
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center new-year-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-effect p-8 rounded-xl relative">
        <div>
          <h1 className="company-title text-center">
            ECUCONDOR
          </h1>
          <p className="company-subtitle text-center">
            Facilitamos sus transacciones en Ecuador, Argentina y Brasil
          </p>
        </div>

        <NewYearCountdown />

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-new-year appearance-none rounded-t-md relative block w-full px-3 py-2 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
<<<<<<< HEAD
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
=======
              <label htmlFor="password" className="sr-only">Contraseña</label>
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
              <input
                id="password"
                name="password"
                type="password"
<<<<<<< HEAD
                autoComplete="current-password"
                required
                className="input-new-year appearance-none rounded-b-md relative block w-full px-3 py-2 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm"
=======
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
<<<<<<< HEAD
              className="btn-new-year group relative w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A27B5C]"
=======
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
<<<<<<< HEAD

          <div className="text-center mt-4">
            <p className="text-[#DCD7C9] text-sm mb-2">¿No tienes una cuenta?</p>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="register-link"
            >
              Registrarse
            </button>
          </div>
=======
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
        </form>
      </div>
    </div>
  );
};

export default Login;
