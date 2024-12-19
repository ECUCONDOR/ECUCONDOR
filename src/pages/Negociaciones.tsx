import React, { useEffect, useState } from 'react';
import { useNegociacion } from '@/hooks/useNegociacion';
import NegociacionForm from '@/components/NegociacionForm';
<<<<<<< HEAD
import { Negociacion } from '@/types/negociacion';

const getStatusColor = (estado: EstadoNegociacion) => {
    switch (estado) {
        case EstadosNegociacion.PENDIENTE:
            return 'bg-yellow-100 text-yellow-800';
        case EstadosNegociacion.EN_PROCESO:
            return 'bg-blue-100 text-blue-800';
        case EstadosNegociacion.VERIFICADO:
            return 'bg-green-100 text-green-800';
        case EstadosNegociacion.COMPLETADO:
            return 'bg-green-100 text-green-800';
        case EstadosNegociacion.FALLIDO:
            return 'bg-red-100 text-red-800';
        case EstadosNegociacion.EXPIRADO:
            return 'bg-gray-100 text-gray-800';
    }
}

const getStatusText = (estado: EstadoNegociacion) => {
    switch (estado) {
        case EstadosNegociacion.PENDIENTE:
            return 'Pendiente';
        case EstadosNegociacion.EN_PROCESO:
            return 'En Proceso';
        case EstadosNegociacion.VERIFICADO:
            return 'Verificado';
        case EstadosNegociacion.COMPLETADO:
            return 'Completado';
        case EstadosNegociacion.FALLIDO:
            return 'Fallido';
        case EstadosNegociacion.EXPIRADO:
            return 'Expirado';
    }
}

=======
import NegociacionStatus from '@/components/NegociacionStatus';
import { Negociacion } from '@/types/negociacion';

>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
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
<<<<<<< HEAD
                    <span
                      className={`px-2 py-1 rounded-lg text-sm ${getStatusColor(negociacion.estado)}`}
                    >
                      {getStatusText(negociacion.estado)}
                    </span>
=======
                    <NegociacionStatus estado={negociacion.estado} />
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
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
