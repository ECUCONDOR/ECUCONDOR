import { useState, useCallback } from 'react';
import { EstadosNegociacion, EstadoNegociacion, Negociacion, CrearNegociacionDTO } from '@/types/negociacion';
import api from '@/config/api';
import { toast } from 'react-toastify';

export const useNegociacion = () => {
  const [estado, setEstado] = useState<EstadoNegociacion>(EstadosNegociacion.PENDIENTE);
  const [negociacionActual, setNegociacionActual] = useState<Negociacion | null>(null);
  const [loading, setLoading] = useState(false);

  const crearNegociacion = useCallback(async (datos: CrearNegociacionDTO) => {
    setLoading(true);
    try {
      const response = await api.post<Negociacion>('/negociaciones', datos);
      setNegociacionActual(response.data);
      setEstado(response.data.estado);
      toast.success('Negociación creada exitosamente');
      return response.data;
    } catch (error) {
      toast.error('Error al crear la negociación');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarEstado = useCallback(async (negociacionId: string, nuevoEstado: EstadoNegociacion) => {
    setLoading(true);
    try {
      const response = await api.patch<Negociacion>(`/negociaciones/${negociacionId}/estado`, {
        estado: nuevoEstado
      });
      setNegociacionActual(response.data);
      setEstado(response.data.estado);
      toast.success('Estado actualizado exitosamente');
      return response.data;
    } catch (error) {
      toast.error('Error al actualizar el estado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerNegociacion = useCallback(async (negociacionId: string) => {
    setLoading(true);
    try {
      const response = await api.get<Negociacion>(`/negociaciones/${negociacionId}`);
      setNegociacionActual(response.data);
      setEstado(response.data.estado);
      return response.data;
    } catch (error) {
      toast.error('Error al obtener la negociación');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const listarNegociaciones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<Negociacion[]>('/negociaciones');
      return response.data;
    } catch (error) {
      toast.error('Error al obtener las negociaciones');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    estado,
    negociacionActual,
    loading,
    crearNegociacion,
    actualizarEstado,
    obtenerNegociacion,
    listarNegociaciones,
    EstadosNegociacion
  };
};
