import React, { useState } from 'react';
import { useNegociacion } from '@/hooks/useNegociacion';
import { CrearNegociacionDTO } from '@/types/negociacion';

const NegociacionForm: React.FC = () => {
  const { crearNegociacion, loading } = useNegociacion();
  const [formData, setFormData] = useState<CrearNegociacionDTO>({
    montoOrigen: 0,
    monedaOrigen: 'USD',
    monedaDestino: 'ARS',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearNegociacion(formData);
    } catch (error) {
      console.error('Error al crear negociación:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'montoOrigen' ? parseFloat(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="montoOrigen" className="block text-sm font-medium text-gray-700">
          Monto
        </label>
        <input
          type="number"
          name="montoOrigen"
          id="montoOrigen"
          value={formData.montoOrigen}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="monedaOrigen" className="block text-sm font-medium text-gray-700">
            Moneda Origen
          </label>
          <select
            name="monedaOrigen"
            id="monedaOrigen"
            value={formData.monedaOrigen}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </div>

        <div>
          <label htmlFor="monedaDestino" className="block text-sm font-medium text-gray-700">
            Moneda Destino
          </label>
          <select
            name="monedaDestino"
            id="monedaDestino"
            value={formData.monedaDestino}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Procesando...' : 'Crear Negociación'}
      </button>
    </form>
  );
};

export default NegociacionForm;
