import React, { useEffect, useState } from 'react';
import { useNegociacion } from '@/hooks/useNegociacion';
import NegociacionForm from '@/components/NegociacionForm';
import NegociacionStatus from '@/components/NegociacionStatus';
import { Negociacion } from '@/types/negociacion';

const NegociacionesPage: React.FC = () => {
  const { listarNegociaciones, loading } = useNegociacion();
  const [negociaciones, setNegociaciones] = useState<Negociacion[]>([]);

  useEffect(() => {
    const cargarNegociaciones = async () => {
      try {
        const data = await listarNegociaciones();
        setNegociaciones(data);
      } catch (error) {
        console.error('Error al cargar negociaciones:', error);
      }
    };

    cargarNegociaciones();
  }, [listarNegociaciones]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de nueva negociación */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Nueva Negociación</h2>
          <NegociacionForm />
        </div>

        {/* Lista de negociaciones */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Mis Negociaciones</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="space-y-4">
              {negociaciones.map((negociacion) => (
                <div
                  key={negociacion.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {negociacion.monedaOrigen} → {negociacion.monedaDestino}
                    </span>
                    <NegociacionStatus estado={negociacion.estado} />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Monto: {negociacion.montoOrigen} {negociacion.monedaOrigen}</p>
                    <p>Tasa: {negociacion.tasaCambio}</p>
                    <p>Fecha: {new Date(negociacion.fechaCreacion).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {negociaciones.length === 0 && (
                <p className="text-gray-500 text-center">No hay negociaciones</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NegociacionesPage;
