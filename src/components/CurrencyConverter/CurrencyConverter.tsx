import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Upload, X, Loader2, CheckCircle2, Clock, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { transactionService } from '@/services/transaction.service';
import { useSession } from '@/hooks/useSession';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { TransactionSummary } from '@/components/TransactionSummary/TransactionSummary';
import { CURRENCIES, CONVERSION_TYPES, BANK_DETAILS } from '@/constants/currencies';
import { formatCurrency, formatDateTime, calculateExchangeAmount } from '@/utils/currency';

interface CurrencyConverterProps {
  comision?: number;
  onFileUploaded?: (fileUrl: string, mensaje: string) => void;
}

export default function CurrencyConverter({
  comision = 0.03,
  onFileUploaded
}: CurrencyConverterProps): JSX.Element {
  const { toast } = useToast();
  const { user } = useSession();
  const router = useRouter();
  const { rates, loading: ratesLoading, error: ratesError, getRate } = useExchangeRates();

  // Estado local
  const [monto, setMonto] = React.useState<string>('');
  const [tipoConversion, setTipoConversion] = React.useState<string>('1');
  const [comisionIncluida, setComisionIncluida] = React.useState<boolean>(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState<number>(15 * 60);
  const [isTimerActive, setIsTimerActive] = React.useState<boolean>(true);
  const [tasaActual, setTasaActual] = React.useState<string>('Consultando...');
  const [tasaCompraActual, setTasaCompraActual] = React.useState<string>('0');
  const [tasaVentaActual, setTasaVentaActual] = React.useState<string>('0');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: { target: { files: FileList | null } }) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;
      
      // Validar el archivo
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
        toast({
          title: "Error",
          description: "Tipo de archivo no permitido. Use JPG o PNG.",
          variant: "destructive",
        });
        return;
      }

      // Crear previsualización
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
      setFile(selectedFile);
      setUploadSuccess(false);
      
      toast({
        title: "Archivo Seleccionado",
        description: "El comprobante está listo para ser procesado",
      });
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    return interval;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Por favor inicie sesión para continuar",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const progressInterval = simulateProgress();

    try {
      // Subir el comprobante primero
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      // Crear y registrar la transacción
      const transaction = await transactionService.createTransaction({
        user_id: user.id,
        amount: Number(monto),
        currency_from: tipoConversion === "1" ? "USD" : "ARS",
        currency_to: tipoConversion === "1" ? "ARS" : "USD",
        exchange_rate: tipoConversion === "1" ? tasaVentaActual : tasaCompraActual,
        converted_amount: tipoConversion === "1" ? 
          Number(monto) * tasaVentaActual : 
          Number(monto) / tasaCompraActual,
        proof_of_payment_url: data.fileUrl,
        status: 'PENDING_VERIFICATION'
      });
      
      setUploadProgress(100);
      clearInterval(progressInterval);
      setShowSuccessAnimation(true);
      setUploadSuccess(true);

      const fecha = new Date();
      const montoNumerico = Number(monto);
      const tasaAplicar = tipoConversion === "1" ? tasaVentaActual : tasaCompraActual;
      const montoConvertido = tipoConversion === "1" ? 
        montoNumerico * tasaAplicar : 
        montoNumerico / tasaAplicar;
      const comisionMonto = tipoConversion === "1" ? montoNumerico * comision : 0;
      const montoTotal = montoNumerico + comisionMonto;

      const mensaje = generarMensajeOperacion({
        tipoConversion,
        fecha,
        montoNumerico,
        tasaAplicar,
        montoConvertido,
        comisionMonto,
        montoTotal,
        comisionIncluida: false
      });

      // Mostrar mensaje de éxito
      toast({
        variant: "default",
        title: "¡Comprobante Recibido! - Ecucondor",
        description: (
          <div className="mt-2 text-sm">
            <p className="font-medium mb-2">Gracias por confiar en nosotros.</p>
            <div className="whitespace-pre-wrap font-mono text-xs bg-black/10 p-2 rounded">
              {mensaje.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ),
        duration: 0,
      });

      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onFileUploaded?.(data.fileUrl, mensaje);
      
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else {
        errorMessage = "Error al procesar el comprobante";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Error al subir archivo:', err);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleMontoChange = (e: { target: { value: string } }) => {
    setMonto(e.target.value);
  };

  const calculateConversion = React.useCallback(() => {
    if (!monto || isNaN(Number(monto))) return null;

    const montoNumerico = Number(monto);
    const conversionType = CONVERSION_TYPES.find(t => t.id === tipoConversion);
    if (!conversionType) return null;

    const rate = getRate(conversionType.from, conversionType.to);
    if (!rate) return null;

    const montoConvertido = montoNumerico * rate;
    const comisionMonto = comisionIncluida ? montoNumerico * comision : 0;
    const montoTotal = montoNumerico + comisionMonto;

    return {
      fromCurrency: conversionType.from,
      toCurrency: conversionType.to,
      amount: montoNumerico,
      convertedAmount: montoConvertido,
      rate,
      commission: comisionIncluida ? comisionMonto : undefined,
      timestamp: new Date()
    };
  }, [monto, tipoConversion, comisionIncluida, getRate, comision]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timeRemaining]);

  const resetTimer = () => {
    setTimeRemaining(15 * 60);
    setIsTimerActive(true);
  };

  React.useEffect(() => {
    const obtenerTasa = async () => {
      try {
        const response = await fetch('/api/tasa');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.tasa) {
          const tasaBinance = parseFloat(data.tasa);
          const factorDescuento = 0.98;
          const tasaFinal = parseFloat((tasaBinance * factorDescuento).toFixed(2));
          setTasaActual(`1 USD = ${tasaFinal} ARS`);
          setTasaVentaActual(tasaFinal);
          setTasaCompraActual(tasaFinal - 50); // Spread for buying
        } else {
          throw new Error("No se recibieron datos de la API");
        }
      } catch (error) {
        setTasaActual(`Error al obtener tasa. Usando tasa por defecto: 1 USD = ${0} ARS`);
      }
    };
    obtenerTasa();
  }, []);

  const handleClearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copiarResultado = async () => {
    try {
      await navigator.clipboard.writeText(resultado);
      toast({
        title: "Copiado",
        description: "Resultado copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el resultado",
        variant: "destructive",
      });
    }
  };

  // Limpiar URL de previsualización al desmontar
  React.useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <Card className="bg-[#111827] p-6 border-0 shadow-lg">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#F3F4F6] text-center mb-6">Cambio de Divisas</h1>

        {/* Timer display */}
        <div className="flex items-center justify-between bg-[#1F2937] p-3 rounded-lg border border-[#374151]">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-[#9CA3AF]" />
            <span className="text-sm font-medium text-[#F3F4F6]">
              Tiempo restante: {formatTime(timeRemaining)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            disabled={timeRemaining === 15 * 60}
            className="border-[#374151] text-[#F3F4F6] hover:bg-[#374151]"
          >
            Reiniciar Tiempo
          </Button>
        </div>

        {timeRemaining === 0 && (
          <div className="bg-[#1F2937] border-l-4 border-yellow-500 p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm text-[#F3F4F6]">
                El tiempo ha expirado. Por favor, reinicie el temporizador si necesita más tiempo.
              </p>
            </div>
          </div>
        )}

        {/* Tasa de cambio actual */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#F3F4F6] mb-4">Tasa de Cambio Actual</h2>
          <div className="bg-[#1F2937] p-4 rounded-lg border border-[#374151]">
            {ratesLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" />
                <p className="text-[#F3F4F6]">Cargando tasas...</p>
              </div>
            ) : ratesError ? (
              <div className="flex items-center space-x-2 text-[#EF4444]">
                <AlertTriangle className="h-4 w-4" />
                <p>{ratesError}</p>
              </div>
            ) : (
              <p className="text-lg text-[#F3F4F6] font-mono">{tasaActual}</p>
            )}
          </div>
        </div>

        {/* Opciones de conversión */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#F3F4F6]">Opciones de Conversión</h3>
          <RadioGroup
            value={tipoConversion}
            onValueChange={setTipoConversion}
            className="space-y-2"
          >
            {CONVERSION_TYPES.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={type.id} 
                  id={`conversion-${type.id}`} 
                  className="border-[#374151]" 
                />
                <Label 
                  htmlFor={`conversion-${type.id}`} 
                  className="text-[#F3F4F6]"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Input de monto */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#F3F4F6]">Datos de la Transacción</h3>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[#F3F4F6]">
              {tipoConversion === '1' ? 'Monto en USD' : 
               tipoConversion === '2' ? 'Monto en ARS' :
               tipoConversion === '3' ? 'Monto en USD' : 'Monto en BRL'}
            </Label>
            <Input
              id="amount"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-[#1F2937] border-[#374151] text-[#F3F4F6] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
              placeholder="Ingrese el monto"
            />
          </div>

          {tipoConversion === '1' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCommission"
                checked={comisionIncluida}
                onCheckedChange={(checked) => setComisionIncluida(checked as boolean)}
                className="border-[#374151] text-[#3B82F6]"
              />
              <Label htmlFor="includeCommission" className="text-[#F3F4F6]">
                Comisión incluida ({(comision * 100).toFixed(1)}%)
              </Label>
            </div>
          )}
        </div>

        {/* Resumen de la transacción */}
        {monto && !isNaN(Number(monto)) && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F3F4F6]">Resumen</h3>
            {(() => {
              const conversion = calculateConversion();
              if (!conversion) return null;
              return (
                <TransactionSummary {...conversion} />
              );
            })()}
          </div>
        )}

        {/* Comprobante de Pago */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#F3F4F6]">Comprobante de Pago</h3>
          <div className="relative">
            <Input
              id="file"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="bg-[#1F2937] border-[#374151] text-[#F3F4F6] cursor-pointer focus:border-[#3B82F6] focus:ring-[#3B82F6]"
              disabled={uploading}
            />
            {filePreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border border-[#374151]"
                />
              </motion.div>
            )}
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress 
                value={uploadProgress} 
                className="w-full bg-[#374151]"
                indicatorClassName="bg-[#3B82F6]"
              />
              <p className="text-sm text-[#9CA3AF] text-center">
                {uploadProgress < 100 ? 'Subiendo comprobante...' : '¡Subida completada!'}
              </p>
            </div>
          )}

          {file && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Comprobante
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {uploadSuccess && (
            <div className="text-center space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <CheckCircle2 className="h-12 w-12 text-[#10B981]" />
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-[#F3F4F6]">
                    ¡Comprobante subido exitosamente!
                  </h3>
                  <div className="text-sm text-[#9CA3AF] space-y-2">
                    <p>
                      El tiempo de transacción dependerá de la disponibilidad de nuestros operadores.
                    </p>
                    <p className="font-medium">
                      Para esperas de más de 4 horas, por favor contáctenos por WhatsApp:
                      <a 
                        href="https://wa.me/5491166599559" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] hover:text-[#2563eb] ml-2"
                      >
                        +54 9 11 6659-9559
                      </a>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetTimer();
                        setUploadSuccess(false);
                        setShowSuccessAnimation(false);
                        setUploadProgress(0);
                      }}
                      className="border-[#374151] text-[#F3F4F6] hover:bg-[#374151] w-full sm:w-auto"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Nueva Operación
                    </Button>
                    <Button
                      onClick={() => {
                        const confirmed = window.confirm('¿Está seguro que desea ir al dashboard?');
                        if (confirmed) {
                          router.push('/dashboard');
                        }
                      }}
                      className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white w-full sm:w-auto"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Ir al Dashboard
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function generarMensajeOperacion({
  tipoConversion,
  fecha,
  montoNumerico,
  tasaAplicar,
  montoConvertido,
  comisionMonto,
  montoTotal,
  comisionIncluida
}: {
  tipoConversion: string;
  fecha: Date;
  montoNumerico: number;
  tasaAplicar: number;
  montoConvertido: number;
  comisionMonto: number;
  montoTotal: number;
  comisionIncluida: boolean;
}) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  return `📊 RESUMEN DE OPERACIÓN
─────────────────────────
${tipoConversion === "1" ? "🔄 USD ➜ ARS" : "🔄 ARS ➜ USD"}
${fecha.toLocaleDateString('es-ES', options)}

💱 DETALLES
• Monto: ${tipoConversion === "1" ? "USD" : "ARS"} ${montoNumerico.toFixed(2)}
• Tasa: ${tasaAplicar.toFixed(2)}
• Total: ${tipoConversion === "1" ? "ARS" : "USD"} ${montoConvertido.toFixed(2)}
${tipoConversion === "1" && !comisionIncluida ? `• Comisión: USD ${comisionMonto.toFixed(2)}
• Monto final a transferir: USD ${montoTotal.toFixed(2)}` : ''}

🏦 DATOS BANCARIOS
• Banco: Produbanco
• Cuenta: Pro Pyme
• Número: 27059070809
• Titular: Ecucondor S.A.S.
• RUC: 1391937000001
• Email: ecucondor@gmail.com

⏱️ TIEMPOS DE PROCESAMIENTO
• Tiempo estimado: 5 min - 4 horas
• Para esperas mayores a 4 horas:
  Contacte por WhatsApp: wa.me/5491166599559

📤 Envíe su comprobante por este medio
🌐 ecucondor.com`;
}
