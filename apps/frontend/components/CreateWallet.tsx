import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { KeyIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const CreateWallet = () => {
  const [wallet, setWallet] = useState<{ address: string; privateKey: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/wallets/create`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setWallet(res.data);
      toast.success('Wallet creada exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear wallet');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={handleCreateWallet} 
        disabled={loading}
        className="w-full p-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Creando Wallet...</span>
          </>
        ) : (
          <>
            <KeyIcon className="h-5 w-5" />
            <span>Crear Nueva Wallet</span>
          </>
        )}
      </button>
      
      {wallet && (
        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-300 text-sm">Dirección:</label>
                <button
                  onClick={() => copyToClipboard(wallet.address, 'Dirección')}
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="text-white break-all bg-gray-800/50 p-2 rounded border border-gray-600">{wallet.address}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-300 text-sm">Clave Privada:</label>
                <button
                  onClick={() => copyToClipboard(wallet.privateKey, 'Clave privada')}
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="text-white break-all bg-gray-800/50 p-2 rounded border border-gray-600">{wallet.privateKey}</p>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-900/20 rounded border border-red-800/50">
              <span className="text-red-400 text-sm font-medium">⚠️</span>
              <p className="text-red-400 text-sm">
                Guarda tu clave privada de forma segura. No la compartas con nadie.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWallet;
