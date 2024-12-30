import { supabase } from '@/lib/supabase/client';

export class PaymentService {
  static async createPixPayment(data: {
    amount: number;
    description: string;
    userId: string;
  }) {
    try {
      const { data: payment, error } = await supabase
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

      if (error) throw error;
      return payment;
    } catch (error) {
      throw new Error('Error creating PIX payment');
    }
  }

  static async createQRPayment(data: {
    amount: number;
    description: string;
    userId: string;
  }) {
    try {
      const { data: payment, error } = await supabase
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

      if (error) throw error;
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
  }) {
    try {
      const { data: payment, error } = await supabase
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

      if (error) throw error;
      return payment;
    } catch (error) {
      throw new Error('Error creating card payment');
    }
  }

  static async createDispute(data: {
    paymentId: string;
    reason: string;
    userId: string;
  }) {
    try {
      const { data: dispute, error } = await supabase
        .from('disputes')
        .insert({
          paymentId: data.paymentId,
          reason: data.reason,
          userId: data.userId,
          status: 'OPEN'
        })
        .select()
        .single();

      if (error) throw error;
      return dispute;
    } catch (error) {
      throw new Error('Error creating dispute');
    }
  }
}
