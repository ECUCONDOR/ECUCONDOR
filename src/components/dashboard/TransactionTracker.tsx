'use client';

import React, { useState, useEffect } from 'react';
import { Check, Clock, Bell, Share2, Download } from 'lucide-react';

interface Transaction {
  id: string;
  status: 'verifying' | 'processing' | 'completed';
  amountSent: number;
  amountReceived: number;
  exchangeRate: number;
  currency: string;
  timestamp: string;
}

const mockTransaction: Transaction = {
  id: 'ECU20231213001',
  status: 'verifying',
  amountSent: 1000,
  amountReceived: 1315000,
  exchangeRate: 1315,
  currency: 'ARS',
  timestamp: new Date().toISOString()
};

export default function TransactionTracker() {
  const [currentStatus, setCurrentStatus] = useState(mockTransaction.status);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTime] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= 120) {
          setCurrentStatus('processing');
        }
        if (prev >= 300) {
          setCurrentStatus('completed');
          clearInterval(timer);
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getProgressPercentage = () => {
    return Math.min((timeElapsed / estimatedTime) * 100, 100);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Estado y Progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Seguimiento de Operación</h2>
          <span className="text-sm text-gray-400">#{mockTransaction.id}</span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Progreso</span>
            <span className="text-sm text-gray-400">{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#722F37] rounded-full h-2 transition-all duration-500" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className={`text-center ${currentStatus === 'verifying' ? 'text-[#722F37]' : 'text-green-500'}`}>
            <div className="text-sm font-medium">Verificación</div>
            {timeElapsed >= 120 ? <Check className="h-4 w-4 mx-auto" /> : <Clock className="h-4 w-4 mx-auto animate-spin" />}
          </div>
          <div className={`text-center ${currentStatus === 'processing' ? 'text-[#722F37]' : currentStatus === 'completed' ? 'text-green-500' : 'text-gray-500'}`}>
            <div className="text-sm font-medium">Procesamiento</div>
            {timeElapsed >= 300 ? <Check className="h-4 w-4 mx-auto" /> : timeElapsed >= 120 ? <Clock className="h-4 w-4 mx-auto animate-spin" /> : <Clock className="h-4 w-4 mx-auto" />}
          </div>
          <div className={`text-center ${currentStatus === 'completed' ? 'text-green-500' : 'text-gray-500'}`}>
            <div className="text-sm font-medium">Completado</div>
            {currentStatus === 'completed' ? <Check className="h-4 w-4 mx-auto" /> : <Clock className="h-4 w-4 mx-auto" />}
          </div>
        </div>
      </div>

      {/* Detalles de la transacción */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between py-2 border-b border-gray-700">
          <span className="text-gray-400">Estado</span>
          <span className={`font-medium ${
            currentStatus === 'completed' ? 'text-green-500' : 'text-[#722F37]'
          }`}>
            {currentStatus === 'completed' ? 'Completada' : 'En Proceso'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-700">
          <span className="text-gray-400">Monto Enviado</span>
          <span className="font-medium text-white">USD {mockTransaction.amountSent.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-700">
          <span className="text-gray-400">Tasa de Cambio</span>
          <span className="font-medium text-white">{mockTransaction.exchangeRate.toFixed(2)} {mockTransaction.currency}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-400">Monto a Recibir</span>
          <span className="font-medium text-green-500">{mockTransaction.amountReceived.toFixed(2)} {mockTransaction.currency}</span>
        </div>
      </div>

      {/* Notificaciones y Acciones */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Bell className="h-6 w-6 text-[#722F37]" />
          <div>
            <p className="font-medium text-white">Notificaciones Automáticas</p>
            <p className="text-sm text-gray-400">
              Recibirás actualizaciones por email y WhatsApp
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Share2 className="h-6 w-6 text-[#722F37]" />
          <div>
            <p className="font-medium text-white">Número de Seguimiento</p>
            <p className="text-sm text-gray-400">
              {mockTransaction.id}
            </p>
          </div>
        </div>
        {currentStatus === 'completed' && (
          <div className="flex items-start gap-4">
            <Download className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium text-white">Comprobante</p>
              <button className="text-sm text-[#722F37] hover:text-[#8B3A44]">
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
