import React, { useState } from 'react';
import {
  DollarSign,
  ArrowRight,
  RefreshCw,
  CreditCard,
  CheckCircle,
  Upload,
  Send,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const EstadosOperacion = {
  INICIO: 'inicio',
  DATOS_BANCARIOS: 'datos_bancarios',
  ESPERANDO_PAGO: 'esperando_pago',
  VERIFICACION_PAGO: 'verificacion_pago',
  TRANSFERENCIA: 'transferencia',
  COMPLETADO: 'completado'
} as const;

const SistemaCambio = () => {
  // Estados principales
  const [estadoActual, setEstadoActual] = useState(EstadosOperacion.INICIO);
  const [datosCambio, setDatosCambio] = useState({
    monto: '',
    tipoCambio: '1',
    comisionIncluida: false,
    resultado: null,
    comprobantePago: null,
    aliasCBU: '',
    datosVerificacion: null
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos bancarios de ejemplo (en producción vendrían de la base de datos)
  const datosBancarios = {
    banco: 'Banco Ejemplo',
    titular: 'EcuCondor S.A.',
    cuenta: '0000-1111-2222-3333',
    alias: 'ECUCONDOR.PAGOS',
    cuit: '30-12345678-9'
  };

  // Funciones principales
  const calcularCambio = async () => {
    setCargando(true);
    setError(null);
    try {
      // Aquí iría la llamada a tu API de cálculo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEstadoActual(EstadosOperacion.DATOS_BANCARIOS);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleComprobanteUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDatosCambio({...datosCambio, comprobantePago: file});
    }
  };

  const verificarPago = async () => {
    setCargando(true);
    setError(null);
    try {
      setEstadoActual(EstadosOperacion.VERIFICACION_PAGO);
      // Aquí iría la lógica de OCR y verificación
      await new Promise(resolve => setTimeout(resolve, 3000));
      setEstadoActual(EstadosOperacion.TRANSFERENCIA);
    } catch (err: any) {
      setError(err.message);
      setEstadoActual(EstadosOperacion.DATOS_BANCARIOS);
    } finally {
      setCargando(false);
    }
  };

  const realizarTransferencia = async () => {
    setCargando(true);
    setError(null);
    try {
      // Aquí iría la lógica de transferencia
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEstadoActual(EstadosOperacion.COMPLETADO);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const reiniciarOperacion = () => {
    setEstadoActual(EstadosOperacion.INICIO);
    setDatosCambio({
      monto: '',
      tipoCambio: '1',
      comisionIncluida: false,
      resultado: null,
      comprobantePago: null,
      aliasCBU: '',
      datosVerificacion: null
    });
    setError(null);
  };

  // Componentes de pasos
  const CalculadoraInicial = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a convertir
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {datosCambio.tipoCambio === '1' ? 'USD' : 'ARS'}
            </span>
            <input
              type="number"
              value={datosCambio.monto}
              onChange={(e) => setDatosCambio({...datosCambio, monto: e.target.value})}
              className="w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        <button
          onClick={() => setDatosCambio({...datosCambio, tipoCambio: '1'})}
          className={`p-4 rounded-lg border-2 ${
            datosCambio.tipoCambio === '1' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
          }`}
        >
          USD a ARS
        </button>

        <button
          onClick={() => setDatosCambio({...datosCambio, tipoCambio: '2'})}
          className={`p-4 rounded-lg border-2 ${
            datosCambio.tipoCambio === '2' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
          }`}
        >
          ARS a USD
        </button>
      </div>

      <button
        onClick={calcularCambio}
        className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        disabled={!datosCambio.monto}
      >
        Calcular y Continuar
      </button>
    </div>
  );

  const DatosBancariosVista = () => (
    <div className="space-y-6">
      <div className="bg-cyan-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">
          Datos para realizar el depósito
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Banco:</span>
            <span className="font-medium">{datosBancarios.banco}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Titular:</span>
            <span className="font-medium">{datosBancarios.titular}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cuenta:</span>
            <span className="font-medium">{datosBancarios.cuenta}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Alias:</span>
            <span className="font-medium">{datosBancarios.alias}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CUIT:</span>
            <span className="font-medium">{datosBancarios.cuit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monto a depositar:</span>
            <span className="font-medium text-cyan-800">
              {datosCambio.tipoCambio === '1' 
                ? `USD ${datosCambio.monto}`
                : `ARS ${datosCambio.monto}`}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">Subir comprobante de pago</h4>
        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-cyan-500">
            <Upload className="text-gray-400" size={24} />
            <span className="mt-2 text-sm text-gray-500">
              {datosCambio.comprobantePago ? 'Cambiar comprobante' : 'Subir comprobante'}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleComprobanteUpload}
            />
          </label>
        </div>
      </div>

      <button
        onClick={verificarPago}
        className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        disabled={!datosCambio.comprobantePago}
      >
        Verificar Pago
      </button>
    </div>
  );

  const VerificacionPago = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <RefreshCw size={40} className="text-cyan-600 animate-spin" />
      </div>
      <p className="text-center text-gray-600">
        Verificando el comprobante de pago...
        <br />
        Esto puede tomar unos minutos
      </p>
    </div>
  );

  const DatosTransferencia = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
        <CheckCircle className="text-green-500" size={24} />
        <span className="text-green-700">Pago verificado correctamente</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingrese su Alias/CBU para recibir la transferencia
        </label>
        <input
          type="text"
          value={datosCambio.aliasCBU}
          onChange={(e) => setDatosCambio({...datosCambio, aliasCBU: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
          placeholder="Alias o CBU"
        />
      </div>

      <button
        onClick={realizarTransferencia}
        className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        disabled={!datosCambio.aliasCBU}
      >
        Realizar Transferencia
      </button>
    </div>
  );

  const OperacionCompletada = () => (
    <div className="space-y-6 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto" />
      <h3 className="text-2xl font-bold text-gray-800">
        ¡Operación Completada!
      </h3>
      <p className="text-gray-600">
        La transferencia ha sido realizada exitosamente.
        <br />
        Recibirá un correo con los detalles de la operación.
      </p>
      <button
        onClick={reiniciarOperacion}
        className="w-full py-3 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
      >
        Realizar Nueva Operación
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Cambio de Divisas
        </h2>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            Tiempo estimado: 5-10 minutos
          </span>
        </div>
      </div>

      {/* Progreso */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Object.values(EstadosOperacion).map((estado, index) => (
            <div
              key={estado}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                Object.values(EstadosOperacion).indexOf(estadoActual) >= index
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-cyan-600 rounded-full transition-all duration-500"
            style={{
              width: `${
                (Object.values(EstadosOperacion).indexOf(estadoActual) + 1) *
                (100 / Object.keys(EstadosOperacion).length)
              }%`
            }}
          />
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contenido según estado */}
      {estadoActual === EstadosOperacion.INICIO && <CalculadoraInicial />}
      {estadoActual === EstadosOperacion.DATOS_BANCARIOS && <DatosBancariosVista />}
      {estadoActual === EstadosOperacion.VERIFICACION_PAGO && <VerificacionPago />}
      {estadoActual === EstadosOperacion.TRANSFERENCIA && <DatosTransferencia />}
      {estadoActual === EstadosOperacion.COMPLETADO && <OperacionCompletada />}
    </div>
  );
};

export default SistemaCambio;
