'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bankInfo, generalBankDetails } from '@/components/bankinfo';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    amountUSD: '',
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    beneficiaryName: '',
    beneficiaryDNI: '',
    beneficiaryCBU: '',
    beneficiaryAlias: '',
    transferDate: '',
    transferTime: '',
    bankOrigin: '',
    receiptNumber: '',
    lastFourDigits: '',
    additionalDetails: '',
    bankDestination: '',
  });

  const [adjustedRate] = useState(1120.4 * 0.965); // Tasa ajustada con reducción del 3.5%

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas (puedes expandirlas según tus necesidades)
    if (!formData.amountUSD || isNaN(Number(formData.amountUSD))) {
      alert('Por favor, ingresa un monto válido en USD.');
      return;
    }
    if (!formData.senderEmail.includes('@')) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    // Agrega más validaciones según sea necesario

    try {
      // Enviar datos a Make.com
      const response = await fetch('https://hook.us2.make.com/vk4r6xteeest2rbuh0s378ys8fwth9l9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, adjustedRate }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos.');
      }

      // Redirigir a la página de agradecimiento
      router.push('/thank-you');
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al enviar la información. Por favor, intenta nuevamente.');
    }
  };

  const selectedBankInfo = formData.bankDestination
    ? bankInfo[formData.bankDestination as keyof typeof bankInfo]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] to-[#003366] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-amber-500">
          ECUCONDOR Registro de Transacción
        </h1>
        <form onSubmit={handleSubmit} className="bg-[#00264D] p-8 rounded-lg shadow-md">

          {/* Monto en USD y ARS */}
          <h2 className="text-xl font-bold mb-4">Formulario de Registro</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold mb-1">Monto en USD</label>
              <input
                type="number"
                name="amountUSD"
                placeholder="0"
                value={formData.amountUSD}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Monto en ARS</label>
              <input
                type="text"
                value={
                  formData.amountUSD && !isNaN(Number(formData.amountUSD))
                    ? (parseFloat(formData.amountUSD) * adjustedRate).toFixed(2)
                    : '0.00'
                }
                readOnly
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
              />
              <p className="text-sm text-zinc-500 mt-2">
                Tasa ajustada: ${adjustedRate.toFixed(2)} ARS/USD
              </p>
            </div>
          </div>

          {/* Datos del Remitente */}
          <h2 className="text-xl font-bold mb-4">Datos del Remitente</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold mb-1">Nombre Completo</label>
              <input
                type="text"
                name="senderName"
                placeholder="Ingrese su nombre completo"
                value={formData.senderName}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="senderEmail"
                placeholder="ejemplo@correo.com"
                value={formData.senderEmail}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Teléfono</label>
              <input
                type="tel"
                name="senderPhone"
                placeholder="+593 o 0..."
                value={formData.senderPhone}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
                pattern="^\+?[\d\s\-]{7,15}$"
              />
            </div>
          </div>

          {/* Datos del Beneficiario */}
          <h2 className="text-xl font-bold mb-4">Datos del Beneficiario</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold mb-1">Nombre Completo</label>
              <input
                type="text"
                name="beneficiaryName"
                placeholder="Ingrese el nombre completo del beneficiario"
                value={formData.beneficiaryName}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">DNI del Beneficiario</label>
              <input
                type="text"
                name="beneficiaryDNI"
                placeholder="DNI del beneficiario"
                value={formData.beneficiaryDNI}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">CBU del Beneficiario</label>
              <input
                type="text"
                name="beneficiaryCBU"
                placeholder="CBU del beneficiario"
                value={formData.beneficiaryCBU}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
                pattern="^\d{22}$" // Asumiendo que el CBU tiene 22 dígitos
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Alias del Beneficiario</label>
              <input
                type="text"
                name="beneficiaryAlias"
                placeholder="Alias del beneficiario"
                value={formData.beneficiaryAlias}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
          </div>

          {/* Detalles de la Transferencia */}
          <h2 className="text-xl font-bold mb-4">Detalles de la Transferencia</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold mb-1">Fecha de Transferencia</label>
              <input
                type="date"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Hora de Transferencia</label>
              <input
                type="time"
                name="transferTime"
                value={formData.transferTime}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Número de Comprobante</label>
              <input
                type="text"
                name="receiptNumber"
                placeholder="Número de comprobante"
                value={formData.receiptNumber}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Últimos 4 Dígitos</label>
              <input
                type="text"
                name="lastFourDigits"
                placeholder="Últimos 4 dígitos"
                value={formData.lastFourDigits}
                onChange={handleChange}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
                required
                pattern="^\d{4}$"
              />
            </div>
          </div>

          {/* Banco de Destino */}
          <h2 className="text-xl font-bold mb-4">Banco de Destino</h2>
          <div className="mb-8">
            <label className="block text-sm font-bold mb-1">Seleccione el Banco de Destino</label>
            <select
              name="bankDestination"
              value={formData.bankDestination}
              onChange={handleChange}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3"
              required
            >
              <option value="">Seleccione un banco</option>
              <option value="Produbanco">Produbanco</option>
              <option value="Internacional">Banco Internacional</option>
              <option value="Guayaquil">Banco Guayaquil</option>
              <option value="Pacífico">Banco Pacífico</option>
            </select>
          </div>

          {/* Datos Bancarios del Banco Seleccionado */}
          {selectedBankInfo && (
            <div className="mb-8 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-bold mb-4">🏦 Datos Bancarios de Transferencia</h3>
              <p className="mb-2">
                👤 Nombre del Titular:{' '}
                <span className="text-cyan-400">{generalBankDetails.accountHolderName}</span>
              </p>
              <p className="mb-2">
                📜 Identificación RUC:{' '}
                <span className="text-cyan-400">{generalBankDetails.ruc}</span>
              </p>
              <p className="mb-4">
                🛠 Correo de Contacto:{' '}
                <span className="text-cyan-400">{generalBankDetails.contactEmail}</span>
              </p>
              <p className="mb-2">
                🏦 Banco:{' '}
                <span className="text-yellow-400">{formData.bankDestination}</span>
              </p>
              {selectedBankInfo.accountType && (
                <p className="mb-2">
                  🌐 Tipo de Cuenta:{' '}
                  <span className="text-yellow-400">{selectedBankInfo.accountType}</span>
                </p>
              )}
              <p className="mb-2">
                📜 Número de Cuenta:{' '}
                <span className="text-yellow-400">{selectedBankInfo.accountNumber}</span>
              </p>
            </div>
          )}

          {/* Detalles Adicionales */}
          <h2 className="text-xl font-bold mb-4">Detalles Adicionales</h2>
          <div className="mb-8">
            <label className="block text-sm font-bold mb-1">Detalles adicionales</label>
            <textarea
              name="additionalDetails"
              placeholder="Escriba cualquier detalle adicional"
              value={formData.additionalDetails}
              onChange={handleChange}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-3 h-32"
            />
          </div>

          {/* Botón de Enviar */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-pink-500 text-black font-bold px-8 py-4 rounded-full hover:opacity-90 transition-all"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
