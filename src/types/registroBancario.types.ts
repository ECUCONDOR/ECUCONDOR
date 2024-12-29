export type RegistroBancarioType = {
  // Campos del sistema
  id?: string;
  created_at?: string;
  updated_at?: string;

  // Datos Personales (Inmutables)
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  estado_civil: string;
  genero: string;

  // Datos de Contacto (Mutables)
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais_residencia: string;

  // Información Laboral (Mutable)
  ocupacion: string;
  empresa: string;
  cargo_actual: string;
  antiguedad_laboral: string;
  ingresos_mensuales: number;
  direccion_laboral: string;

  // Información Bancaria
  bancos_previos: string;
  cuentas_activas: string;
  referencia_bancaria: string;
  estado?: string;
  origen_fondos: string;
  monto_estimado_transacciones: number;
  frecuencia_transacciones: string;

  // Documentos
  documento_identidad?: File | null;
  comprobante_ingresos?: File | null;
  comprobante_domicilio?: File | null;
}

// Tipo para el historial de cambios
export type RegistroHistoricoType = {
  id: string;
  registro_id: string;
  campo_modificado: string;
  valor_anterior: string;
  valor_nuevo: string;
  modificado_por: string;
  fecha_modificacion: string;
}

// Tipo para documentos bancarios
export type DocumentoBancarioType = {
  id: string;
  registro_id: string;
  tipo_documento: string;
  url_documento: string;
  fecha_subida: string;
  hash_documento: string;
}

// Define the DocumentoResultado interface
export interface DocumentoResultado {
  url_documento: string;
  id: string;
  registro_id: string;
  tipo_documento: string;
}

// Enums para valores predefinidos
export enum TipoDocumento {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC'
}

export enum EstadoCivil {
  SOLTERO = 'SOLTERO',
  CASADO = 'CASADO',
  DIVORCIADO = 'DIVORCIADO',
  VIUDO = 'VIUDO',
  UNION_LIBRE = 'UNION_LIBRE'
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO'
}

export enum EstadoRegistro {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO'
}

// Tipo para respuestas de la API
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Tipo para filtros de búsqueda
export type FiltrosBusqueda = {
  tipo_documento?: TipoDocumento;
  numero_documento?: string;
  estado?: EstadoRegistro;
  fecha_inicio?: string;
  fecha_fin?: string;
}
