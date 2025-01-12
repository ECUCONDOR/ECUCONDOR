'use client';

import React from 'react';
import CurrencyConverter from '@/components/CurrencyConverter/CurrencyConverter';

const CambioDivisas = () => {
  return (
    <div className="min-h-screen bg-[#0f1421] text-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Cambio de Divisas</h1>
      </div>
      
      <div className="container mx-auto p-6">
        <CurrencyConverter />

        <div className="mt-6 p-4 bg-[#1a1f2e] rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Información Importante</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Las tasas de cambio se actualizan en tiempo real</li>
            <li>La comisión por operación es del 5%</li>
            <li>Conserve su comprobante para futuras referencias</li>
            <li>Para montos superiores a USD 1000, contacte a su ejecutivo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CambioDivisas;
