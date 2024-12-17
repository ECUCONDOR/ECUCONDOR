'use client';

import React, { useState } from 'react';
import { 
  Home, 
  LineChart, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  User, 
  Bell, 
  Menu,
  X,
  ChevronRight,
  LogOut,
  HelpCircle,
  Package,
  Search
} from 'lucide-react';

const NavItem = ({ icon: Icon, text, active, onClick }: {
  icon: React.ElementType;
  text: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-[#722F37] bg-opacity-20 text-[#722F37]' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-[#722F37]'
    }`}
  >
    <Icon size={20} className={active ? 'text-[#722F37]' : ''} />
    <span className="font-medium">{text}</span>
  </button>
);

const SearchBar = () => (
  <div className="relative">
    <input 
      type="text" 
      placeholder="Buscar..."
      className="w-64 px-4 py-2 pl-10 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-[#722F37] focus:ring-1 focus:ring-[#722F37]"
    />
    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Nueva transacción', message: 'Transferencia completada exitosamente', time: '2m' },
    { id: 2, title: 'Actualización', message: 'Sistema actualizado a la versión 2.0', time: '5m' },
    { id: 3, title: 'Alerta', message: 'Nuevo mensaje de soporte', time: '15m' },
  ];

  const navItems = [
    { icon: Home, text: 'Inicio', id: 'dashboard' },
    { icon: LineChart, text: 'Estadísticas', id: 'stats' },
    { icon: ShoppingCart, text: 'Transacciones', id: 'transactions' },
    { icon: Package, text: 'Servicios', id: 'services' },
    { icon: DollarSign, text: 'Finanzas', id: 'finances' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Barra superior */}
      <header className="fixed top-0 right-0 w-full h-20 bg-gray-900 border-b border-gray-800 z-20 px-6">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <img 
                  src="/api/placeholder/40/40" 
                  alt="Logo" 
                  className="rounded-lg"
                />
              </div>
              <h1 className="text-2xl font-bold text-[#722F37]">
                ECUCONDOR
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <SearchBar />
            
            {/* Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              >
                <Bell size={24} className="text-gray-400 hover:text-[#722F37]" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#722F37] rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="font-medium text-lg text-[#722F37]">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800">
                        <div className="flex justify-between">
                          <span className="font-medium text-[#722F37]">{notification.title}</span>
                          <span className="text-sm text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Menú de usuario */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-[#722F37] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-[#722F37]" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-200">Admin</p>
                  <p className="text-sm text-gray-500">Administrador</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                  <div className="p-4 border-b border-gray-800">
                    <p className="font-medium text-gray-200">Admin</p>
                    <p className="text-sm text-gray-500">admin@ecucondor.com</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg flex items-center space-x-2">
                      <Settings size={18} />
                      <span>Configuración</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg flex items-center space-x-2">
                      <HelpCircle size={18} />
                      <span>Ayuda</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-[#722F37] hover:bg-gray-800 rounded-lg flex items-center space-x-2">
                      <LogOut size={18} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Barra lateral */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 pt-24 transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-20'
        } z-10`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              active={currentPage === item.id}
              onClick={() => setCurrentPage(item.id)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-[#722F37] bg-opacity-20 rounded-lg flex items-center justify-center">
                <HelpCircle size={18} className="text-[#722F37]" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="font-medium text-gray-200">Centro de Ayuda</p>
                  <p className="text-sm text-gray-500">Soporte 24/7</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button className="w-full py-2 bg-[#722F37] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                Contactar Soporte
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={`mt-20 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300 min-h-screen bg-gray-900`}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
