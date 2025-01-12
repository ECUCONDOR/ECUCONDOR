import { createBrowserSupabaseClient } from '@/lib/supabase';
import { Transaction, TransactionStatus, TransactionUpdate } from '@/types/transaction';

class TransactionService {
  private readonly TABLE_NAME = 'transactions';

  private getClient() {
    return createBrowserSupabaseClient();
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: transaction, error } = await this.getClient()
        .from(this.TABLE_NAME)
        .insert([
          {
            user_id: data.user_id,
            amount: data.amount,
            currency_from: data.currency_from,
            currency_to: data.currency_to,
            exchange_rate: data.exchange_rate,
            converted_amount: data.converted_amount,
            status: 'PENDING_VERIFICATION',
            proof_of_payment_url: data.proof_of_payment_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
      return transaction;
    } catch (error) {
      console.error('Unexpected error creating transaction:', error);
      throw error;
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    updates: Partial<TransactionUpdate> = {}
  ) {
    const { data: transaction, error } = await this.getClient()
      .from(this.TABLE_NAME)
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...updates,
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  async getTransactionsByUser(userId: string) {
    const { data: transactions, error } = await this.getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return transactions;
  }

  async getTransactionById(transactionId: string) {
    const { data: transaction, error } = await this.getClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return transaction;
  }
}

export const transactionService = new TransactionService();
