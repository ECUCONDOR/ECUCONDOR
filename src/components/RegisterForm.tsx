import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthError } from '@supabase/supabase-js';
import { sendEmail, getWelcomeEmailTemplate } from '@/utils/emailUtils';

const supabase = createClientComponentClient();

interface FormErrors {
  [key: string]: string;
}

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial (!@#$%^&*)');
    }
    return errors;
  };

  const validateDocumentNumber = (docNum: string): boolean => {
    // Ajusta esta validación según el formato específico de documento que necesites
    return /^[A-Za-z0-9]{6,12}$/.test(docNum);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validación de campos vacíos
    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
      isValid = false;
    }

    if (!documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
      isValid = false;
    } else if (!validateDocumentNumber(documentNumber)) {
      newErrors.documentNumber = 'Formato de documento inválido';
      isValid = false;
    }

    if (!birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
      isValid = false;
    } else {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      if (age < 18) {
        newErrors.birthDate = 'Debes ser mayor de 18 años';
        isValid = false;
      }
    }

    if (!nationality.trim()) {
      newErrors.nationality = 'La nacionalidad es requerida';
      isValid = false;
    }

    if (!gender.trim()) {
      newErrors.gender = 'El género es requerido';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Correo electrónico inválido';
      isValid = false;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join('. ');
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setSuccess('');
    setErrors({});

    if (!validateForm()) {
      setGeneralError('Por favor, corrija los errores en el formulario.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            documentNumber,
            birthDate,
            nationality,
            gender,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setGeneralError('Este correo electrónico ya está registrado. Por favor, inicie sesión.');
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      if (data?.user) {
        await sendEmail(
          email,
          '¡Bienvenido a EcuCondor!',
          getWelcomeEmailTemplate(firstName)
        );

        setSuccess('¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta.');
        // Limpiar el formulario
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setDocumentNumber('');
        setBirthDate('');
        setNationality('');
        setGender('');
      } else {
        setGeneralError('No se pudo completar el registro. Por favor, intente nuevamente.');
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Ocurrió un error inesperado durante el registro.');
      }
      console.error('Error durante el registro:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field: string) => {
    return errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;
  };

  return (
    <div className="max-w-md mx-auto">
      {generalError && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{generalError}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Nombres"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full p-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('firstName')}
        </div>

        <div>
          <input
            type="text"
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full p-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('lastName')}
        </div>

        <div>
          <input
            type="text"
            placeholder="Número de Documento"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className={`w-full p-3 border ${errors.documentNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('documentNumber')}
        </div>

        <div>
          <input
            type="date"
            placeholder="Fecha de Nacimiento"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={`w-full p-3 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('birthDate')}
        </div>

        <div>
          <input
            type="text"
            placeholder="Nacionalidad"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className={`w-full p-3 border ${errors.nationality ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('nationality')}
        </div>

        <div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={`w-full p-3 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          >
            <option value="">Seleccione género</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
          {renderError('gender')}
        </div>

        <div>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('email')}
        </div>

        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('password')}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full p-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
            required
          />
          {renderError('confirmPassword')}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#D2691E] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
