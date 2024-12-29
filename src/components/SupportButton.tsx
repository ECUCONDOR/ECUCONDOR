'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { COLORS } from '@/constants/colors';

const SupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const commonTopics = [
    'Problema con una transferencia',
    'Consulta sobre tipos de cambio',
    'Estado de mi cuenta',
    'Problema técnico',
    'Otros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('');
      setIsOpen(false);
      alert('Mensaje enviado. Nuestro equipo se pondrá en contacto contigo pronto.');
    } catch (error) {
      alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  const selectTopic = (topic: string) => {
    setMessage(`${topic}: `);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#8B4513] text-white p-4 rounded-full shadow-lg hover:bg-[#D2691E] transition-colors z-50 flex items-center gap-2"
        aria-label="Soporte"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Soporte</span>
      </button>

      {/* Modal de soporte */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
            {/* Encabezado */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-[#8B4513]" />
                <h3 className="text-xl font-semibold text-[#8B4513]">Soporte Ecucondor</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                ¿En qué podemos ayudarte? Selecciona un tema o escribe tu consulta.
              </p>

              {/* Temas comunes */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                {commonTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => selectTopic(topic)}
                    className="text-sm p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left text-gray-700"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent resize-none bg-gray-50"
                  rows={4}
                  required
                />

                {/* Información de contacto */}
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                  <p className="font-medium mb-2">Horario de atención:</p>
                  <p>Lunes a Viernes: 9:00 - 18:00</p>
                  <p>WhatsApp: +54 9 11 XXXX-XXXX</p>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    isSending || !message.trim()
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#8B4513] text-white hover:bg-[#D2691E]'
                  }`}
                >
                  <span>{isSending ? 'Enviando...' : 'Enviar mensaje'}</span>
                  {!isSending && <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportButton;
