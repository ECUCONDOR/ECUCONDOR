'use client';

import { useState } from 'react';
import { PaymentService } from '@/services/payment';
import { PaymentTransaction, QRCode } from '@/types/payment.types';
import { useToast } from '@/components/ui/use-toast';

export const usePayments = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast, addToast } = useToast();

    const createPixPayment = async (amount: number, currency: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await PaymentService.createPixPayment(
                'USER_ID', // Replace with actual user ID
                amount,
                currency
            );
            addToast('PIX Payment Created. Check your PIX app to complete the payment');
            return result;
        } catch (err: any) {
            setError(err.message);
            addToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createQRPayment = async (
        amount: number,
        currency: string,
        provider: 'MERCADOPAGO' | 'MODO'
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await PaymentService.createQRPayment(
                'USER_ID', // Replace with actual user ID
                amount,
                currency,
                provider
            );
            addToast('QR Code Generated. Scan the QR code to complete payment');
            return result;
        } catch (err: any) {
            setError(err.message);
            addToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createCardPayment = async (
        amount: number,
        currency: string,
        cardDetails: {
            number: string;
            exp_month: number;
            exp_year: number;
            cvc: string;
        }
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await PaymentService.createCardPayment(
                'USER_ID', // Replace with actual user ID
                amount,
                currency,
                cardDetails
            );
            addToast('Card Payment Processed. Your payment is being processed');
            return result;
        } catch (err: any) {
            setError(err.message);
            addToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createDispute = async (
        transactionId: string,
        reason: string,
        details: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await PaymentService.createDispute(
                transactionId,
                reason,
                details
            );
            addToast('Dispute Created. We will review your case shortly');
            return result;
        } catch (err: any) {
            setError(err.message);
            addToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createPixPayment,
        createQRPayment,
        createCardPayment,
        createDispute
    };
};
