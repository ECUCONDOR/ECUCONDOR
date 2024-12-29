import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Tipos y interfaces
export interface MetodoPago {
  id: string;
  usuarioId: string;
  tipo: TipoPago;
  estado: EstadoPago;
  detalles: DetallesPago;
  createdAt: Date;
}

export type TipoPago = 'TARJETA' | 'BANCO' | 'PIX';
export type EstadoPago = 'ACTIVO' | 'INACTIVO';
export type EstadoTransaccion = 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO';

export interface DetallesPago {
  banco?: string;
  numeroCuenta?: string;
  tipoCuenta?: string;
  pixKey?: string;
  ultimosDigitos?: string;
}

export interface ResultadoPago {
  id: string;
  estado: EstadoTransaccion;
  mensaje: string;
  fecha: Date;
}

export interface DatosTarjeta {
  numeroTarjeta: string;
  expiracion: string;
  cvv: string;
  titular: string;
  monto: number;
}

export interface RespuestaProcesamiento {
  id: string;
  status: 'success' | 'error';
  message?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'TARJETA' | 'BANCO' | 'PIX';
  data: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Utilidades y herramientas
export const generatePaymentId = (): string => {
  return uuidv4();
};

// Clase principal del servicio de pagos
export class PaymentService {
  private static supabase = supabase;

  /**
   * Genera un nuevo identificador de pago
   */
  static generateId(): string {
    return generatePaymentId();
  }

  /**
   * Obtiene los métodos de pago de un usuario
   */
  static async obtenerMetodosPago(usuarioId: string): Promise<MetodoPago[]> {
    try {
      const { data, error } = await this.supabase
        .from('metodos_pago')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('estado', 'ACTIVO');

      if (error) {
        console.error('Error al obtener métodos de pago:', error);
        throw new Error('Error al obtener métodos de pago');
      }

      return data?.map(this.formatearMetodoPago) || [];
    } catch (error) {
      console.error('Error en obtenerMetodosPago:', error);
      throw error;
    }
  }

  /**
   * Agrega un nuevo método de pago
   */
  static async agregarMetodoPago(
    usuarioId: string,
    tipo: TipoPago,
    detalles: DetallesPago
  ): Promise<MetodoPago> {
    try {
      // Validaciones
      if (!usuarioId) throw new Error('ID de usuario requerido');
      if (!this.validarDetallesPago(tipo, detalles)) {
        throw new Error('Detalles de pago inválidos');
      }

      const nuevoMetodo = {
        id: generatePaymentId(),
        usuario_id: usuarioId,
        tipo,
        estado: 'ACTIVO' as EstadoPago,
        detalles,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('metodos_pago')
        .insert(nuevoMetodo)
        .select()
        .single();

      if (error) throw error;

      return this.formatearMetodoPago(data);
    } catch (error) {
      console.error('Error en agregarMetodoPago:', error);
      throw error;
    }
  }

  /**
   * Realiza un pago utilizando un método específico
   */
  static async procesarPago(
    metodoPagoId: string,
    monto: number,
    descripcion: string
  ): Promise<ResultadoPago> {
    try {
      // Validaciones
      if (!this.validarMonto(monto)) {
        throw new Error('Monto inválido');
      }

      // Obtener método de pago
      const metodoPago = await this.obtenerMetodoPagoPorId(metodoPagoId);
      if (!metodoPago) {
        throw new Error('Método de pago no encontrado');
      }

      // Crear transacción
      const transaccion = {
        id: generatePaymentId(),
        metodo_pago_id: metodoPagoId,
        monto,
        descripcion,
        estado: 'PENDIENTE' as EstadoTransaccion,
        fecha: new Date().toISOString()
      };

      const { data: nuevaTransaccion, error } = await this.supabase
        .from('transacciones')
        .insert(transaccion)
        .select()
        .single();

      if (error) throw error;

      return {
        id: nuevaTransaccion.id,
        estado: nuevaTransaccion.estado,
        mensaje: 'Transacción iniciada correctamente',
        fecha: new Date(nuevaTransaccion.fecha)
      };
    } catch (error) {
      console.error('Error en procesarPago:', error);
      throw error;
    }
  }

  static async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    try {
      const { data: methods, error } = await this.supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error al obtener métodos de pago:', error);
        throw error;
      }

      if (!methods) return [];

      return methods.map(method => ({
        id: method.id,
        userId: method.user_id,
        type: method.type,
        data: method.data,
        isActive: method.is_active,
        createdAt: new Date(method.created_at),
        updatedAt: new Date(method.updated_at)
      }));
    } catch (error) {
      console.error('Error en getUserPaymentMethods:', error);
      throw error;
    }
  }

  static async addPaymentMethod(userId: string, type: PaymentMethod['type'], data: any): Promise<PaymentMethod> {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    try {
      const newMethod = {
        id: uuidv4(),
        user_id: userId,
        type,
        data,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: method, error } = await this.supabase
        .from('payment_methods')
        .insert([newMethod])
        .select()
        .single();

      if (error) {
        console.error('Error al agregar método de pago:', error);
        throw error;
      }

      if (!method) {
        throw new Error('No se pudo crear el método de pago');
      }

      return {
        id: method.id,
        userId: method.user_id,
        type: method.type,
        data: method.data,
        isActive: method.is_active,
        createdAt: new Date(method.created_at),
        updatedAt: new Date(method.updated_at)
      };
    } catch (error) {
      console.error('Error en addPaymentMethod:', error);
      throw error;
    }
  }

  static async procesarPagoTarjeta(datos: DatosTarjeta): Promise<RespuestaProcesamiento> {
    // Validar número de tarjeta usando algoritmo de Luhn
    if (!this.validarNumeroTarjeta(datos.numeroTarjeta)) {
      throw new Error('Número de tarjeta inválido');
    }

    // Validar fecha de expiración
    if (!this.validarExpiracion(datos.expiracion)) {
      throw new Error('Fecha de expiración inválida');
    }

    // Validar CVV
    if (!this.validarCVV(datos.cvv)) {
      throw new Error('CVV inválido');
    }

    // Validar titular
    if (!datos.titular.trim()) {
      throw new Error('Nombre del titular requerido');
    }

    // Validar monto
    if (datos.monto <= 0) {
      throw new Error('Monto inválido');
    }

    // Generar ID único para la transacción
    const transactionId = uuidv4();

    try {
      // Aquí iría la lógica de procesamiento real con el gateway de pago
      // Por ahora, simulamos un procesamiento exitoso
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Almacenar la transacción en la base de datos
      const { error } = await this.supabase
        .from('transactions')
        .insert([
          {
            id: transactionId,
            amount: datos.monto,
            type: 'TARJETA',
            status: 'completed',
            data: {
              last4: datos.numeroTarjeta.slice(-4),
              expMonth: datos.expiracion.split('/')[0],
              expYear: datos.expiracion.split('/')[1],
              cardHolder: datos.titular
            }
          }
        ]);

      if (error) {
        throw error;
      }

      return {
        id: transactionId,
        status: 'success'
      };
    } catch (error) {
      console.error('Error al procesar pago:', error);
      throw error;
    }
  }

  // Métodos privados de utilidad

  private static formatearMetodoPago(data: any): MetodoPago {
    return {
      id: data.id,
      usuarioId: data.usuario_id,
      tipo: data.tipo,
      estado: data.estado,
      detalles: data.detalles,
      createdAt: new Date(data.created_at)
    };
  }

  private static validarDetallesPago(
    tipo: TipoPago,
    detalles: DetallesPago
  ): boolean {
    switch (tipo) {
      case 'TARJETA':
        return Boolean(detalles.ultimosDigitos);
      case 'BANCO':
        return Boolean(
          detalles.banco &&
          detalles.numeroCuenta &&
          detalles.tipoCuenta
        );
      case 'PIX':
        return Boolean(detalles.pixKey);
      default:
        return false;
    }
  }

  private static validarMonto(monto: number): boolean {
    const MONTO_MINIMO = 0.01;
    const MONTO_MAXIMO = 50000;
    return monto >= MONTO_MINIMO && monto <= MONTO_MAXIMO;
  }

  private static async obtenerMetodoPagoPorId(id: string): Promise<MetodoPago | null> {
    const { data, error } = await this.supabase
      .from('metodos_pago')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.formatearMetodoPago(data);
  }

  private static validarDatosTarjeta(datos: DatosTarjeta): void {
    if (!this.validarNumeroTarjeta(datos.numeroTarjeta)) {
      throw new Error('Número de tarjeta inválido');
    }
    if (!this.validarExpiracion(datos.expiracion)) {
      throw new Error('Fecha de expiración inválida');
    }
    if (!this.validarCVV(datos.cvv)) {
      throw new Error('CVV inválido');
    }
    if (!datos.titular || datos.titular.length < 3) {
      throw new Error('Nombre del titular inválido');
    }
    if (!this.validarMonto(datos.monto)) {
      throw new Error('Monto inválido');
    }
  }

  private static validarNumeroTarjeta(numero: string): boolean {
    const digitos = numero.replace(/\D/g, '');
    
    if (digitos.length < 13 || digitos.length > 19) {
      return false;
    }

    // Algoritmo de Luhn
    let suma = 0;
    let doble = false;

    for (let i = digitos.length - 1; i >= 0; i--) {
      let digito = parseInt(digitos.charAt(i));

      if (doble) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }

      suma += digito;
      doble = !doble;
    }

    return (suma % 10) === 0;
  }

  private static validarExpiracion(expiracion: string): boolean {
    const [mes, ano] = expiracion.split('/').map(Number);
    const fechaActual = new Date();
    const anoActual = fechaActual.getFullYear() % 100;
    const mesActual = fechaActual.getMonth() + 1;

    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12) {
      return false;
    }

    if (ano < anoActual || (ano === anoActual && mes < mesActual)) {
      return false;
    }

    return true;
  }

  private static validarCVV(cvv: string): boolean {
    const digitos = cvv.replace(/\D/g, '');
    return digitos.length >= 3 && digitos.length <= 4;
  }

  private static obtenerUltimosDigitos(numeroTarjeta: string): string {
    return numeroTarjeta.replace(/\D/g, '').slice(-4);
  }

  private static detectarMarcaTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\D/g, '');
    if (/^4/.test(numero)) return 'VISA';
    if (/^5[1-5]/.test(numero)) return 'MASTERCARD';
    if (/^3[47]/.test(numero)) return 'AMEX';
    if (/^6(?:011|5)/.test(numero)) return 'DISCOVER';
    return 'OTRA';
  }
}

// Exportación por defecto para compatibilidad
export default PaymentService;
