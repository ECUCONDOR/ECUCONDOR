import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { Decimal } from 'decimal.js';

export type Currency = 'USD' | 'ARS';
export type ExchangeDirection = 'USD_TO_ARS' | 'ARS_TO_USD';

export interface ExchangeRate {
  rate: number;
  timestamp: number;
}

export interface ExchangeTransaction {
  id?: string;
  user_id: string;
  tipo: 'exchange';
  monto: number;
  moneda_origen: Currency;
  moneda_destino: Currency;
  cuenta_bancaria: string | null;
  comprobante: string;
  alias: string;
  estado: 'pendiente' | 'completado' | 'rechazado';
  created_at?: string;
}

export interface ExchangeFormData {
  amount: number;
  targetCurrency: Currency;
  bankAccount?: string;
  comprobante: string;
  alias: string;
}

export class ExchangeService {
  private supabase = createBrowserClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  private static BINANCE_API_URL = 'https://api.binance.com/api/v3/klines?symbol=USDTARS&interval=1d&limit=1';
  private static RATE_ADJUSTMENT = 50; // Ajuste para compra de dólares
  private static DEFAULT_RATE = 1315;
  private static SMALL_AMOUNT_LIMIT = 15;
  private static SMALL_AMOUNT_FEE = 0.50;
  private static COMMISSION_RATE = 0.03;

  async getExchangeRate(): Promise<ExchangeRate> {
    try {
      const response = await fetch(ExchangeService.BINANCE_API_URL);
      if (!response.ok) throw new Error('Error al obtener tasa de cambio');
      
      const data = await response.json();
      if (data && data[0]) {
        const binanceRate = new Decimal(data[0][4]);
        const adjustedRate = binanceRate.times(0.985); // Descuento del 1.5%
        
        return {
          rate: adjustedRate.toNumber(),
          timestamp: Date.now()
        };
      }
      throw new Error('Datos de tasa no disponibles');
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return {
        rate: ExchangeService.DEFAULT_RATE,
        timestamp: Date.now()
      };
    }
  }

  calculateExchange(amount: string | number, direction: ExchangeDirection, rate: number): {
    sourceAmount: number;
    targetAmount: number;
    appliedRate: number;
    commission: number;
    totalAmount: number;
  } {
    const sourceAmount = new Decimal(amount);
    const exchangeRate = new Decimal(rate);
    let commission = new Decimal(0);
    
    // Calcular comisión
    if (direction === 'USD_TO_ARS') {
      if (sourceAmount.lessThan(ExchangeService.SMALL_AMOUNT_LIMIT)) {
        commission = new Decimal(ExchangeService.SMALL_AMOUNT_FEE);
      } else {
        commission = sourceAmount.times(ExchangeService.COMMISSION_RATE);
      }
    }
    
    if (direction === 'USD_TO_ARS') {
      const amountAfterCommission = sourceAmount.minus(commission);
      const targetAmount = amountAfterCommission.times(exchangeRate);
      return {
        sourceAmount: sourceAmount.toNumber(),
        targetAmount: targetAmount.toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber(),
        appliedRate: exchangeRate.toNumber(),
        commission: commission.toNumber(),
        totalAmount: sourceAmount.toNumber()
      };
    } else {
      const adjustedRate = exchangeRate.plus(ExchangeService.RATE_ADJUSTMENT);
      const targetAmount = sourceAmount.dividedBy(adjustedRate);
      return {
        sourceAmount: sourceAmount.toNumber(),
        targetAmount: targetAmount.toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber(),
        appliedRate: adjustedRate.toNumber(),
        commission: 0,
        totalAmount: sourceAmount.toNumber()
      };
    }
  }

  async createExchangeTransaction(data: ExchangeFormData): Promise<{ error: any | null, data: any | null }> {
    try {
      const { data: transaction, error } = await this.supabase
        .from('transacciones')
        .insert([{
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
          tipo: 'exchange',
          monto: data.amount,
          moneda_origen: data.targetCurrency === 'ARS' ? 'USD' : 'ARS',
          moneda_destino: data.targetCurrency,
          cuenta_bancaria: data.bankAccount || null,
          comprobante: data.comprobante,
          alias: data.alias,
          estado: 'pendiente'
        }])
        .select()
        .single();

      if (error) throw error;
      return { error: null, data: transaction };
    } catch (error) {
      console.error('Error creating exchange transaction:', error);
      return { error, data: null };
    }
  }

  async getUserTransactions(userId: string): Promise<{ error: any | null, data: ExchangeTransaction[] | null }> {
    try {
      const { data, error } = await this.supabase
        .from('transacciones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { error: null, data };
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return { error, data: null };
    }
  }

  async getTransactionById(transactionId: string): Promise<{ error: any | null, data: ExchangeTransaction | null }> {
    try {
      const { data, error } = await this.supabase
        .from('transacciones')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return { error: null, data };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return { error, data: null };
    }
  }

  async updateTransactionStatus(
    transactionId: string, 
    status: 'completado' | 'rechazado'
  ): Promise<{ error: any | null, data: any | null }> {
    try {
      const { data, error } = await this.supabase
        .from('transacciones')
        .update({ estado: status })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return { error: null, data };
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return { error, data: null };
    }
  }
}
