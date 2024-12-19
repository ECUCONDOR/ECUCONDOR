import React from 'react';
import CreateWallet from '../components/CreateWallet';
import WalletBalance from '../components/WalletBalance';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletIcon } from '@heroicons/react/24/outline';

const Wallet = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <WalletIcon className="h-10 w-10 text-white" />
          <h1 className="text-4xl font-bold text-center text-white">
            Gestión de Wallets
          </h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Crear Nueva Wallet
            </h2>
            <CreateWallet />
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Consultar Balance
            </h2>
            <WalletBalance />
          </div>
        </div>
      </div>
      <ToastContainer 
        position="bottom-right"
        theme="dark"
        autoClose={3000}
      />
    </div>
  );
};

export default Wallet;
