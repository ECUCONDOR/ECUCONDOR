import { supabase } from '@/lib/supabase/client';
import { PaymentRecord, InsertResponse, SingleResponse } from '@/types/supabase.types';

export class PaymentService {
  static async createPixPayment(data: {
    amount: number;
    description: string;
    userId: string;
  }): Promise<SingleResponse<PaymentRecord>> {
    try {
      const payment = await supabase
        .from('payments')
        .insert({
          type: 'PIX',
          amount: data.amount,
          description: data.description,
          userId: data.userId,
          status: 'PENDING'
        })
        .select()
        .single();

      return payment;
    } catch (error) {
      throw new Error('Error creating PIX payment');
    }
  }

  static async createQRPayment(data: {
    amount: number;
    description: string;
    userId: string;
  }): Promise<SingleResponse<PaymentRecord>> {
    try {
      const payment = await supabase
        .from('payments')
        .insert({
          type: 'QR',
          amount: data.amount,
          description: data.description,
          userId: data.userId,
          status: 'PENDING'
        })
        .select()
        .single();

      return payment;
    } catch (error) {
      throw new Error('Error creating QR payment');
    }
  }

  static async createCardPayment(data: {
    amount: number;
    description: string;
    userId: string;
    cardDetails: {
      number: string;
      expiry: string;
      cvc: string;
    };
  }): Promise<SingleResponse<PaymentRecord>> {
    try {
      const payment = await supabase
        .from('payments')
        .insert({
          type: 'CARD',
          amount: data.amount,
          description: data.description,
          userId: data.userId,
          cardDetails: data.cardDetails,
          status: 'PENDING'
        })
        .select()
        .single();

      return payment;
    } catch (error) {
      throw new Error('Error creating card payment');
    }
  }

  static async createDispute(data: {
    paymentId: string;
    reason: string;
    userId: string;
  }): Promise<SingleResponse<PaymentRecord>> {
    try {
      const dispute = await supabase
        .from('disputes')
        .insert({
          paymentId: data.paymentId,
          reason: data.reason,
          userId: data.userId,
          status: 'OPEN'
        })
        .select()
        .single();

      return dispute;
    } catch (error) {
      throw new Error('Error creating dispute');
    }
  }
}
