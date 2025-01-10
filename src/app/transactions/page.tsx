'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';

export default function TransactionsPage() {
  const [transactionType, setTransactionType] = useState('deposit');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'ARS',
    description: '',
    destinationBank: '',
    accountNumber: '',
    accountHolder: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envío
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Depositar / Transferir</h1>

        {/* Selector de tipo de transacción */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTransactionType('deposit')}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
              transactionType === 'deposit'
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Depositar
          </button>
          <button
            onClick={() => setTransactionType('transfer')}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
              transactionType === 'transfer'
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Transferir
          </button>
        </div>

        {/* Formulario */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
                Monto
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white text-gray-900"
                placeholder="0.00"
                required
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="currency">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="BRL">Reales (BRL)</option>
              </select>
            </div>

            {/* Campos específicos para transferencia */}
            {transactionType === 'transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="destinationBank">
                    Banco Destino
                  </label>
                  <input
                    type="text"
                    id="destinationBank"
                    name="destinationBank"
                    value={formData.destinationBank}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="accountNumber">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="accountHolder">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    id="accountHolder"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>
              </>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent bg-white text-gray-900"
                rows={3}
                placeholder="Agregar una descripción..."
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full bg-[#8B4513] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#D2691E] transition-colors"
            >
              {transactionType === 'deposit' ? 'Realizar Depósito' : 'Realizar Transferencia'}
            </button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
