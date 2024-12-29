export type MetodoPago = {
  id: string;
  user_id: string;
  tipo: 'BANCO' | 'PIX' | 'TARJETA';
  detalles: {
    banco?: string;
    numero_cuenta?: string;
    tipo_cuenta?: string;
    pix_key?: string;
    ultimos_digitos?: string;
  };
  activo: boolean;
  predeterminado: boolean;
  created_at: string;
  updated_at: string;
};

export type Deposito = {
  id: string;
  user_id: string;
  metodo_pago_id: string;
  monto: number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  comprobante_url?: string;
  referencia: string;
  created_at: string;
  updated_at: string;
};

export type EstadoTransaccion = 
  | 'PENDIENTE' 
  | 'PROCESANDO' 
  | 'COMPLETADA' 
  | 'FALLIDA' 
  | 'RECHAZADA';

export type TipoTransaccion = 
  | 'DEPOSITO' 
  | 'RETIRO' 
  | 'TRANSFERENCIA' 
  | 'COMISION';

export interface TransaccionExtendida {
  id: string;
  user_id: string;
  tipo: TipoTransaccion;
  monto: number;
  estado: EstadoTransaccion;
  metodo_pago_id?: string;
  deposito_id?: string;
  detalles: {
    descripcion?: string;
    comprobante_url?: string;
    referencia?: string;
    motivo_rechazo?: string;
  };
  created_at: string;
  updated_at: string;
}
