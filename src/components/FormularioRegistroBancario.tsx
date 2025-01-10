'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useDashboardContext } from '@/contexts/dashboard-context';
import type { Database } from '@/types/supabase';

type FormField = 
  | 'nombres'
  | 'apellidos'
  | 'numeroDocumento'
  | 'fechaNacimiento'
  | 'nacionalidad'
  | 'genero'
  | 'celular'
  | 'email'
  | 'direccion'
  | 'ciudad'
  | 'provincia'
  | 'origenFondos'
  | 'montoEstimadoTransacciones'
  | 'frecuenciaTransacciones'
  | 'documentoIdentidad';

interface FormData {
  [key: string]: string | null | undefined;
  error?: string | null;
}

interface ValidationErrors {
  [key: string]: string;
}

const COLORS = {
  primary: '#8B4513',
  secondary: '#D2691E',
  background: '#FFF8DC',
  text: '#4A4A4A',
  border: '#DEB887',
  success: '#059669'
};

const steps = [
  {
    title: 'Información Personal',
    icon: 'User',
    fields: ['nombres', 'apellidos', 'numeroDocumento', 'fechaNacimiento', 'nacionalidad', 'genero']
  },
  {
    title: 'Información de Contacto',
    icon: 'CreditCard',
    fields: ['celular', 'email', 'direccion', 'ciudad', 'provincia']
  },
  {
    title: 'Información Financiera',
    icon: 'Shield',
    fields: ['origenFondos', 'montoEstimadoTransacciones', 'frecuenciaTransacciones']
  },
  {
    title: 'Documentación',
    icon: 'CheckCircle',
    fields: ['documentoIdentidad']
  }
];

export function FormularioRegistroBancario() {
  const { clientId } = useDashboardContext();
  const [formData, setFormData] = useState<FormData>({
    nombres: '',
    apellidos: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    nacionalidad: '',
    genero: '',
    celular: '',
    email: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    origenFondos: '',
    montoEstimadoTransacciones: '',
    frecuenciaTransacciones: '',
    documentoIdentidad: null,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('nombre, apellidos, documento_identidad, fecha_nacimiento, nacionalidad, genero')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setFormData(prev => ({
            ...prev,
            nombres: data.nombre,
            apellidos: data.apellidos,
            numeroDocumento: data.documento_identidad,
            fechaNacimiento: data.fecha_nacimiento,
            nacionalidad: data.nacionalidad,
            genero: data.genero,
          }));
        }
      }
    };

    fetchUserData();
  }, []);

  const validateField = (field: string, value: string | null): string | null => {
    if (!value && field !== 'documentoIdentidad') return 'Este campo es requerido';
    
    switch (field) {
      case 'nombres':
      case 'apellidos':
        return value && value.length >= 2 ? null : 'Debe tener al menos 2 caracteres';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value && emailRegex.test(value) ? null : 'Correo electrónico inválido';
      case 'celular':
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return value && phoneRegex.test(value) ? null : 'Número de teléfono inválido';
      case 'numeroDocumento':
        return value && value.length >= 5 ? null : 'Número de documento inválido';
      default:
        return null;
    }
  };

  const handleInputChange = (field: string, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };

  const handleNextStep = () => {
    const currentFields = steps[currentStep - 1].fields;
    let hasErrors = false;
    const newErrors: ValidationErrors = {};

    currentFields.forEach(field => {
      const value = formData[field] ?? null;
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);

      // Validar todos los campos
      let hasErrors = false;
      const newErrors: ValidationErrors = {};

      Object.keys(formData).forEach(field => {
        const value = formData[field] ?? null;
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setErrors(newErrors);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró el usuario');

      // Actualizar perfil
      const { error: profileError } = await supabase
        .from('perfiles_usuario')
        .upsert({
          user_id: user.id,
          nombre: formData.nombres,
          apellido: formData.apellidos,
          telefono: formData.celular,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          pais: formData.provincia,
        });

      if (profileError) throw profileError;

      // Actualizar información adicional
      const { error: additionalInfoError } = await supabase
        .from('informacion_adicional')
        .upsert({
          user_id: user.id,
          origen_fondos: formData.origenFondos,
          monto_estimado: formData.montoEstimadoTransacciones,
          frecuencia_transacciones: formData.frecuenciaTransacciones,
        });

      if (additionalInfoError) throw additionalInfoError;

      // Éxito
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error al guardar el registro:', error);
      setGeneralError('Error al guardar los datos. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    const currentFields = steps[currentStep - 1].fields;

    return (
      <div className="space-y-6">
        {currentFields.map((field) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            {field === 'documentoIdentidad' ? (
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleInputChange(field, e.target.files?.[0]?.name || null)}
                className="w-full p-2 border rounded-md"
              />
            ) : field === 'genero' ? (
              <select
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccione...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            ) : field === 'fechaNacimiento' ? (
              <input
                type="date"
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full p-2 border rounded-md"
                maxLength={field === 'nombres' || field === 'apellidos' ? 100 : undefined}
              />
            )}
            {errors[field] && (
              <p className="text-red-500 text-sm">{errors[field]}</p>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Anterior
            </button>
          )}
          {currentStep < steps.length ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-[#8B4513] text-white rounded-md hover:bg-[#D2691E] ml-auto"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#8B4513] text-white rounded-md hover:bg-[#D2691E] ml-auto disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>

        {generalError && (
          <p className="text-red-500 text-center mt-4">{generalError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`flex flex-col items-center ${
              index + 1 === currentStep
                ? 'text-[#8B4513]'
                : index + 1 < currentStep
                ? 'text-green-500'
                : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <i className={`bi bi-${step.icon} w-8 h-8`}></i>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-1/2 h-0.5 w-[100px] -right-[100px] ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
            <span className="text-sm mt-2">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Current Step Form */}
      <div className="p-6">
        {renderCurrentStep()}
      </div>
    </div>
  );
};