import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const WalletBalance = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckBalance = async () => {
    if (!address.trim()) {
      toast.warning('Por favor, ingresa una dirección de wallet');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/wallets/balance/${address}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBalance(res.data.balance);
      toast.success('Balance obtenido exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al obtener balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Ingresa la dirección de la wallet"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 pl-4 pr-12 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all duration-200 placeholder-gray-400"
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
      </div>

      <button
        onClick={handleCheckBalance}
        disabled={loading}
        className="w-full p-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Consultando...</span>
          </>
        ) : (
          'Consultar Balance'
        )}
      </button>

      {balance !== null && (
        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Balance:</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl font-semibold">{balance}</span>
              <span className="text-yellow-500 font-medium">ETH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
