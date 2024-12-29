'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FormularioBancarioData {
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  nacionalidad: string;
  genero: string;
  celular: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  origenFondos: string;
  montoEstimadoTransacciones: string;
  frecuenciaTransacciones: string;
  documentoIdentidad?: File;
  comprobanteIngresos?: File;
  comprobanteDomicilio?: File;
}

export function useFormularioBancario() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitFormulario = async (data: FormularioBancarioData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let documentoIdentidadUrl = null;
      let comprobanteIngresosUrl = null;
      let comprobanteDomicilioUrl = null;

      // Si hay un documento, subirlo primero
      if (data.documentoIdentidad) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos_bancarios')
          .upload(`documentos/${Date.now()}-${data.documentoIdentidad.name}`, data.documentoIdentidad);

        if (uploadError) {
          throw new Error(`Error al subir documento de identidad: ${uploadError.message}`);
        }

        documentoIdentidadUrl = uploadData?.path;
      }

      if (data.comprobanteIngresos) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos_bancarios')
          .upload(`documentos/${Date.now()}-${data.comprobanteIngresos.name}`, data.comprobanteIngresos);

        if (uploadError) {
          throw new Error(`Error al subir comprobante de ingresos: ${uploadError.message}`);
        }

        comprobanteIngresosUrl = uploadData?.path;
      }

      if (data.comprobanteDomicilio) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos_bancarios')
          .upload(`documentos/${Date.now()}-${data.comprobanteDomicilio.name}`, data.comprobanteDomicilio);

        if (uploadError) {
          throw new Error(`Error al subir comprobante de domicilio: ${uploadError.message}`);
        }

        comprobanteDomicilioUrl = uploadData?.path;
      }

      // Insertar datos del formulario
      const { error: insertError } = await supabase
        .from('clientes_bancarios')
        .insert([{ 
          ...data, 
          documentoIdentidad_url: documentoIdentidadUrl, 
          comprobanteIngresos_url: comprobanteIngresosUrl, 
          comprobanteDomicilio_url: comprobanteDomicilioUrl, 
          estado: 'pendiente_revision', 
          fecha_registro: new Date().toISOString() 
        }]);

      if (insertError) {
        throw new Error(`Error al guardar formulario: ${insertError.message}`);
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Error al enviar formulario:', err.message);
      } else {
        setError('Ocurrió un error inesperado');
        console.error('Error desconocido:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFormulario,
    isSubmitting,
    error,
    success
  };
}
