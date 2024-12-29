import { sendEmail, getTransactionConfirmationTemplate } from '@/utils/emailUtils';

interface TransactionConfirmationProps {
  transactionId: string;
  amount: number;
  currency: string;
  userEmail: string;
}

export const sendTransactionConfirmation = async ({
  transactionId,
  amount,
  currency,
  userEmail
}: TransactionConfirmationProps) => {
  try {
    const date = new Date().toLocaleString();
    
    await sendEmail(
      userEmail,
      'Confirmación de Transacción - EcuCondor',
      getTransactionConfirmationTemplate(
        transactionId,
        amount,
        currency,
        date
      )
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending transaction confirmation:', error);
    throw error;
  }
};
