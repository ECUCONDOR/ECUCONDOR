import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { useRouter } from 'next/navigation';
import { transactionService } from '@/services/transaction.service';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

const CurrencyConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(900);
  const [timerActive, setTimerActive] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useSession();
  const router = useRouter();

  // Verificar autenticación al inicio
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
      toast({
        title: 'Acceso Denegado',
        description: 'Por favor, inicie sesión para realizar operaciones.',
        variant: 'destructive',
      });
    }
  }, [user, router, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !user) {
      toast({
        title: 'Error',
        description: !selectedFile 
          ? 'Por favor, seleccione un archivo.'
          : 'Por favor, inicie sesión para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatus('Iniciando subida...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadStatus('Subiendo archivo...');
      setProgress(25);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(50);
      setUploadStatus('Procesando respuesta...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setProgress(75);
      setUploadStatus('Creando transacción...');

      const amount = 67;
      const currencyFrom = 'USD';
      const currencyTo = 'ARS';
      const exchangeRate = 1171.01;
      const convertedAmount = 78457.67;

      // Crear la transacción
      const transaction = await transactionService.createTransaction({
        user_id: user.id,
        amount,
        currency_from: currencyFrom,
        currency_to: currencyTo,
        exchange_rate: exchangeRate,
        converted_amount: convertedAmount,
        status: 'PENDING_VERIFICATION',
        proof_of_payment_url: data.fileUrl,
      });

      if (!transaction) {
        throw new Error('Error al crear la transacción');
      }

      setProgress(100);
      setUploadStatus('¡Subida completada!');

      const mensaje = `
📊 RESUMEN DE OPERACIÓN
─────────────────────────
🔄 USD ➜ ARS
${new Date().toLocaleString()}

💱 DETALLES
• Monto: USD ${amount.toFixed(2)}
• Tasa: ${exchangeRate.toFixed(2)}
• Total: ARS ${convertedAmount.toFixed(2)}
• Comisión: USD 2.01
• Monto final a transferir: USD ${(amount + 2.01).toFixed(2)}

🏦 DATOS BANCARIOS
• Banco: Produbanco
• Cuenta: Pro Pyme
• Número: 27059070809
• Titular: Ecucondor S.A.S.
• RUC: 1391937000001
• Email: ecucondor@gmail.com

⏱️ TIEMPOS DE PROCESAMIENTO
5 min - 4 horas
Contactar por WhatsApp si demora: wa.me/5491166599559
`;

      toast({
        title: '¡Comprobante Recibido! - Ecucondor',
        description: (
          <>
            <p>
              ¡Subida completada!<br />
              Gracias por estar siempre con Ecucondor<br />
              ¡Comprobante subido exitosamente!
            </p>
            <p>
              Tiempo de transacción de 5 a 4 horas, en casos que se
              superen estas 4 horas, contactar a ayuda en whatsapp
            </p>
            <p>
              Puede continuar realizando operaciones o ir al dashboard.
            </p>
            <div className="bg-black/10 rounded-md p-2 font-mono text-sm whitespace-pre-wrap">
              {mensaje}
            </div>
          </>
        ),
        duration: 0,
      });

      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Error during upload:', error);
      setUploadStatus('Error en la subida');
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar la operación',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFile, toast, user]);

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleResetTimer = () => {
    setTimer(900);
    setTimerActive(true);
    setTimerExpired(false);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    if (timer === 0) {
      setTimerActive(false);
      setTimerExpired(true);
    }
    return () => clearInterval(interval);
  }, [timer, timerActive]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0f1318] min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <div className="bg-[#1a1f24] p-8 rounded-lg w-full max-w-2xl border border-[#2a2f34] shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-[#e5e7eb] text-2xl font-semibold mb-4">
            🏦 CAMBIO DE DÓLARES A PESOS 🏦
          </h2>
        </div>
        <div className="flex items-center justify-center mb-4 text-[#e5e7eb] font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Tiempo Restante: {formatTime(timer)}
          {timerExpired && (
            <span className="ml-2 text-red-500">
              Tiempo Expirado. Por favor, suba su comprobante nuevamente.
            </span>
          )}
        </div>
        <div className="mb-6 space-y-3">
          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-[#2a2f34] rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[#e5e7eb] text-sm text-center">{uploadStatus}</p>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-[#2a2f34] rounded-md p-4 w-full flex flex-col items-center space-y-2 bg-[#1a1f24]"
          >
            {previewUrl && (
              <div className="relative w-48 h-48 overflow-hidden rounded-md border border-[#2a2f34] bg-[#0f1318] mb-2">
                <img
                  src={previewUrl}
                  alt="Comprobante previo"
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={handleClearFile}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 bg-gray-900/70 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <label className="block text-[#e5e7eb] text-sm font-medium">
              Subir Comprobante
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
                ref={fileInputRef}
              />
              <div className="mt-2 px-4 py-2 rounded-md border border-[#2a2f34] bg-[#2a2f34]/10 text-[#e5e7eb] text-center hover:bg-[#2a2f34]/20 cursor-pointer">
                {selectedFile ? `Archivo Seleccionado: ${selectedFile.name}` : 'Seleccionar Archivo'}
              </div>
            </label>
          </motion.div>

          <div className="flex justify-between mt-4 gap-4 flex-col sm:flex-row">
            <button
              type="button"
              onClick={handleResetTimer}
              disabled={!timerExpired}
              className={`
                bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded
                disabled:opacity-50 flex justify-center items-center gap-2
                w-full sm:w-auto
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.183 3.183c.026.026.066.026.091 0l3.183-3.183m-3.181-3.183a5.96 5.96 0 018.486 0L18.11 9.755m-3.186-.755a5.96 5.96 0 00-8.486 0L3.025 9.755" />
              </svg>
              Nueva Operación
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className={`
                bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded
                disabled:opacity-50 flex justify-center items-center gap-2
                w-full sm:w-auto
              `}
            >
              {uploading ? (
                <>
                  Subiendo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="animate-spin w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.183 3.183c.026.026.066.026.091 0l3.183-3.183m-3.181-3.183a5.96 5.96 0 018.486 0L18.11 9.755m-3.186-.755a5.96 5.96 0 00-8.486 0L3.025 9.755"
                    />
                  </svg>
                </>
              ) : (
                <>
                  Subir
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
          <button
            onClick={handleGoToDashboard}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full flex justify-center items-center gap-2 mt-4"
          >
            ¿Está seguro que desea ir al dashboard? Podrá ver el estado de su transacción allí.
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
