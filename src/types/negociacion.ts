export enum EstadosNegociacion {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  VERIFICADO = 'VERIFICADO',
  EXPIRADO = 'EXPIRADO',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO'
}

export type EstadoNegociacion = keyof typeof EstadosNegociacion;

export interface Negociacion {
  id: string;
  estado: EstadoNegociacion;
  montoOrigen: number;
  montoDestino: number;
  monedaOrigen: string;
  monedaDestino: string;
  tasaCambio: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  usuarioId: string;
}

export interface CrearNegociacionDTO {
  montoOrigen: number;
  monedaOrigen: string;
  monedaDestino: string;
}
