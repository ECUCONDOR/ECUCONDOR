import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  RefreshCw,
  CheckCircle,
  Upload,
  AlertCircle,
  Clock,
  Timer,
  Bell
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

// Estados de la negociación
const EstadosNegociacion = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  VERIFICADO: 'verificado',
  EXPIRADO: 'expirado',
  COMPLETADO: 'completado',
  FALLIDO: 'fallido'
} as const;

// Colores según estado
const coloresEstado = {
  pendiente: 'bg-gray-200',
  en_proceso: 'bg-yellow-500',
  verificado: 'bg-green-500',
  expirado: 'bg-red-500',
  completado: 'bg-green-600',
  fallido: 'bg-red-600'
} as const;

// Tiempo máximo en milisegundos (2 horas)
const TIEMPO_MAXIMO = 2 * 60 * 60 * 1000;

interface BarraTiempoProps {
  tiempoInicio: number | null;
  estado: keyof typeof EstadosNegociacion;
  onExpirar: () => void;
}

const BarraTiempo: React.FC<BarraTiempoProps> = ({ tiempoInicio, estado, onExpirar }) => {
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_MAXIMO);
  const [porcentaje, setPorcentaje] = useState(100);

  useEffect(() => {
    if (!tiempoInicio || estado === EstadosNegociacion.COMPLETADO) return;

    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const transcurrido = ahora - tiempoInicio;
      const restante = Math.max(TIEMPO_MAXIMO - transcurrido, 0);
      const porcentajeNuevo = (restante / TIEMPO_MAXIMO) * 100;

      setTiempoRestante(restante);
      setPorcentaje(porcentajeNuevo);

      if (restante === 0 && estado !== EstadosNegociacion.COMPLETADO) {
        onExpirar();
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoInicio, estado, onExpirar]);

  const formatearTiempo = (ms: number) => {
    const minutos = Math.floor(ms / (60 * 1000));
    const segundos = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-gray-500" />
          <span className="text-sm font-medium">
            Tiempo restante: {formatearTiempo(tiempoRestante)}
          </span>
        </div>
        <EstadoIndicador estado={estado} />
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            estado === EstadosNegociacion.COMPLETADO
              ? 'bg-green-500'
              : porcentaje > 50
              ? 'bg-cyan-500'
              : porcentaje > 25
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
};

interface EstadoIndicadorProps {
  estado: keyof typeof EstadosNegociacion;
}

const EstadoIndicador: React.FC<EstadoIndicadorProps> = ({ estado }) => {
  const obtenerColorYTexto = () => {
    switch (estado) {
      case EstadosNegociacion.COMPLETADO:
        return {
          color: 'bg-green-100 text-green-800',
          texto: 'Negociación Completada',
          icono: <CheckCircle className="text-green-500" size={16} />
        };
      case EstadosNegociacion.EN_PROCESO:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          texto: 'En Proceso',
          icono: <RefreshCw className="text-yellow-500" size={16} />
        };
      case EstadosNegociacion.FALLIDO:
        return {
          color: 'bg-red-100 text-red-800',
          texto: 'Pago No Verificado',
          icono: <AlertCircle className="text-red-500" size={16} />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          texto: 'Pendiente',
          icono: <Clock className="text-gray-500" size={16} />
        };
    }
  };

  const { color, texto, icono } = obtenerColorYTexto();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${color}`}>
      {icono}
      <span className="text-sm font-medium">{texto}</span>
    </div>
  );
};

interface NotificacionTiempoProps {
  tiempoRestante: number;
  estado: keyof typeof EstadosNegociacion;
}

const NotificacionTiempo: React.FC<NotificacionTiempoProps> = ({ tiempoRestante, estado }) => {
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (tiempoRestante <= 15 * 60 * 1000 && estado === EstadosNegociacion.EN_PROCESO) {
      setMensaje('¡Quedan menos de 15 minutos para completar la operación!');
      setMostrarNotificacion(true);
    } else if (tiempoRestante <= 30 * 60 * 1000 && estado === EstadosNegociacion.EN_PROCESO) {
      setMensaje('Quedan 30 minutos para completar la operación');
      setMostrarNotificacion(true);
    }
  }, [tiempoRestante, estado]);

  if (!mostrarNotificacion) return null;

  return (
    <Alert variant="warning" className="mb-4">
      <Bell className="h-4 w-4" />
      <AlertDescription>{mensaje}</AlertDescription>
    </Alert>
  );
};

interface SeguimientoOperacionProps {
  estado: keyof typeof EstadosNegociacion;
  tiempoInicio: number | null;
  onExpirar: () => void;
}

const SeguimientoOperacion: React.FC<SeguimientoOperacionProps> = ({ estado, tiempoInicio, onExpirar }) => {
  return (
    <div className="space-y-4">
      {tiempoInicio && (
        <NotificacionTiempo 
          tiempoRestante={TIEMPO_MAXIMO - (Date.now() - tiempoInicio)} 
          estado={estado}
        />
      )}
      <BarraTiempo 
        tiempoInicio={tiempoInicio} 
        estado={estado} 
        onExpirar={onExpirar}
      />
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Estado de la Operación</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ID de Operación:</span>
            <span className="font-medium">#OP-{Date.now().toString().slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Inicio:</span>
            <span className="font-medium">
              {tiempoInicio ? new Date(tiempoInicio).toLocaleTimeString() : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tiempo Máximo:</span>
            <span className="font-medium">2 horas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const NegociacionWrapper: React.FC = () => {
  const [estado, setEstado] = useState<keyof typeof EstadosNegociacion>(EstadosNegociacion.PENDIENTE);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);

  useEffect(() => {
    // Iniciar el tiempo cuando comienza la negociación
    if (estado === EstadosNegociacion.EN_PROCESO && !tiempoInicio) {
      setTiempoInicio(Date.now());
    }
  }, [estado]);

  const handleExpirar = () => {
    setEstado(EstadosNegociacion.FALLIDO);
    // Aquí puedes agregar lógica adicional para manejar la expiración
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Seguimiento de Operación
      </h3>
      <SeguimientoOperacion
        estado={estado}
        tiempoInicio={tiempoInicio}
        onExpirar={handleExpirar}
      />
    </div>
  );
};

export default NegociacionWrapper;
