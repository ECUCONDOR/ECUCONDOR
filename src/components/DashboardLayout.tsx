import React, { useState } from 'react';
import { 
  Home, DollarSign, FileText, BarChart2, Shield,
  Settings, Bell, LogOut, Menu, X, Bitcoin
} from 'lucide-react';
import { CurrencyExchangePanel, CryptoExchangePanel } from './ExchangePanels';

// Colores corporativos
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

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('exchange');

  const menuItems = [
    { 
      id: 'exchange', 
      label: 'Cambio de Divisas', 
      icon: DollarSign, 
      badge: null 
    },
    { 
      id: 'crypto', 
      label: 'Criptomonedas', 
      icon: Bitcoin, 
      badge: 'Hot' 
    },
    { 
      id: 'transactions', 
      label: 'Mis Operaciones', 
      icon: FileText, 
      badge: '3' 
    },
    { 
      id: 'analytics', 
      label: 'Estadísticas', 
      icon: BarChart2, 
      badge: null 
    },
    { 
      id: 'verification', 
      label: 'Verificación', 
      icon: Shield, 
      badge: 'Nuevo' 
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.main }}>
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-30`}
        style={{ backgroundColor: COLORS.background.light }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-10 w-10 mr-3"
                />
                <span className="text-xl font-bold" style={{ color: COLORS.primary.main }}>
                  ECUCONDOR S.A.S
                </span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-full hover:bg-opacity-20"
              >
                <X className="h-6 w-6" style={{ color: COLORS.text.secondary }} />
              </button>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: currentView === item.id ? COLORS.primary.main : 'transparent',
                    color: COLORS.text.primary
                  }}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: COLORS.primary.light,
                        color: COLORS.text.primary 
                      }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Usuario */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center p-2">
              <img 
                src="/avatar.png" 
                alt="Perfil" 
                className="h-10 w-10 rounded-full border-2"
                style={{ borderColor: COLORS.primary.main }}
              />
              <div className="ml-3">
                <p className="font-medium" style={{ color: COLORS.text.primary }}>
                  Eduardo
                </p>
                <p className="text-sm" style={{ color: COLORS.text.muted }}>
                  Cliente Premium
                </p>
              </div>
            </div>
            <button 
              className="mt-2 w-full flex items-center justify-center gap-2 p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: COLORS.primary.main,
                color: COLORS.text.primary
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className={`${isSidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-20 shadow-lg" 
          style={{ backgroundColor: COLORS.background.light }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className={`lg:hidden p-2 rounded-full hover:bg-opacity-20 ${
                    isSidebarOpen ? 'hidden' : ''
                  }`}
                >
                  <Menu className="h-6 w-6" style={{ color: COLORS.text.secondary }} />
                </button>
                <h1 className="ml-2 text-xl font-semibold" 
                  style={{ color: COLORS.text.primary }}>
                  {menuItems.find(item => item.id === currentView)?.label}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Botones del header */}
                <button className="p-2 rounded-full">
                  <Bell className="h-6 w-6" style={{ color: COLORS.text.secondary }} />
                </button>
                <button className="p-2 rounded-full">
                  <Settings className="h-6 w-6" style={{ color: COLORS.text.secondary }} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'exchange' && <CurrencyExchangePanel />}
          {currentView === 'crypto' && <CryptoExchangePanel />}
          {currentView === 'transactions' && (
            <div className="bg-opacity-10 rounded-xl p-6 shadow-xl"
              style={{ backgroundColor: COLORS.background.card }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
                Historial de Operaciones
              </h2>
              {/* Aquí iría el componente de historial de operaciones */}
            </div>
          )}
          {currentView === 'analytics' && (
            <div className="bg-opacity-10 rounded-xl p-6 shadow-xl"
              style={{ backgroundColor: COLORS.background.card }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
                Estadísticas
              </h2>
              {/* Aquí iría el componente de estadísticas */}
            </div>
          )}
          {currentView === 'verification' && (
            <div className="bg-opacity-10 rounded-xl p-6 shadow-xl"
              style={{ backgroundColor: COLORS.background.card }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
                Verificación de Identidad
              </h2>
              {/* Aquí iría el componente de verificación */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
