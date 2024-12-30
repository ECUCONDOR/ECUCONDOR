'use client';

import { useState } from 'react';
import { PaymentService } from '@/services/PaymentService';
import { PaymentTransaction, QRCode } from '@/types/payment.types';
import { useToast } from './use-toast';

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPixPayment = async (amount: number, description: string, userId: string) => {
    setLoading(true);
    try {
      const result = await PaymentService.createPixPayment({
        amount,
        description,
        userId
      });
      toast({
        title: 'Payment created',
        description: 'Your PIX payment has been created successfully'
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create PIX payment',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createQRPayment = async (amount: number, description: string, userId: string) => {
    setLoading(true);
    try {
      const result = await PaymentService.createQRPayment({
        amount,
        description,
        userId
      });
      toast({
        title: 'Payment created',
        description: 'Your QR payment has been created successfully'
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create QR payment',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCardPayment = async (
    amount: number,
    description: string,
    userId: string,
    cardDetails: {
      number: string;
      expiry: string;
      cvc: string;
    }
  ) => {
    setLoading(true);
    try {
      const result = await PaymentService.createCardPayment({
        amount,
        description,
        userId,
        cardDetails
      });
      toast({
        title: 'Payment created',
        description: 'Your card payment has been created successfully'
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create card payment',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async (paymentId: string, reason: string, userId: string) => {
    setLoading(true);
    try {
      const result = await PaymentService.createDispute({
        paymentId,
        reason,
        userId
      });
      toast({
        title: 'Dispute created',
        description: 'Your dispute has been created successfully'
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create dispute',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPixPayment,
    createQRPayment,
    createCardPayment,
    createDispute
  };
}
