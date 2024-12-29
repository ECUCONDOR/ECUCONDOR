import { supabase } from './supabase';
import type { 
  CurrencyType, 
  CustodyAccount, 
  CustodyOperation, 
  ExchangeRate, 
  OperationStep 
} from '@/types/custody';

class CustodyService {
  private limits = {
    daily: {
      ARS: 1000000,
      USD: 5000
    },
    monthly: {
      ARS: 10000000,
      USD: 50000
    }
  };

  async registerCompanyAccount(type: CurrencyType, data: {
    bank: string;
    accountNumber: string;
    cbu: string;
    alias: string;
    owner: string;
    ownerDocument: string;
  }): Promise<CustodyAccount> {
    const account: Omit<CustodyAccount, 'id'> = {
      type,
      bank: data.bank,
      accountNumber: data.accountNumber,
      cbu: data.cbu,
      alias: data.alias,
      owner: data.owner,
      ownerDocument: data.ownerDocument,
      balance: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      recentOperations: [],
      dailyLimit: this.limits.daily[type],
      monthlyLimit: this.limits.monthly[type]
    };

    const { data: newAccount, error } = await supabase
      .from('custody_accounts')
      .insert([account])
      .select()
      .single();

    if (error) throw error;
    return newAccount;
  }

  async processOperation(data: {
    type: 'BUY' | 'SELL';
    sourceCurrency: CurrencyType;
    targetCurrency: CurrencyType;
    sourceAmount: number;
    sourceAccountId: string;
    targetAccountId: string;
  }): Promise<CustodyOperation> {
    // Verificar límites
    const withinLimits = await this.checkLimits(data.sourceAccountId, data.sourceAmount);
    if (!withinLimits) {
      throw new Error('Operation exceeds established limits');
    }

    const exchangeRate = await this.getExchangeRate();
    const targetAmount = this.calculateTargetAmount(
      data.sourceAmount,
      data.type,
      exchangeRate
    );

    const operation: Omit<CustodyOperation, 'id'> = {
      type: data.type,
      sourceCurrency: data.sourceCurrency,
      targetCurrency: data.targetCurrency,
      sourceAmount: data.sourceAmount,
      targetAmount,
      exchangeRate,
      sourceAccountId: data.sourceAccountId,
      targetAccountId: data.targetAccountId,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [{
        step: 'START',
        date: new Date(),
        status: 'COMPLETED',
        details: 'Operation started successfully'
      }]
    };

    const { data: newOperation, error } = await supabase
      .from('custody_operations')
      .insert([operation])
      .select()
      .single();

    if (error) throw error;
    return newOperation;
  }

  async confirmFundsReceived(operationId: string, receipt: string): Promise<CustodyOperation> {
    const { data: operation, error: fetchError } = await supabase
      .from('custody_operations')
      .select()
      .eq('id', operationId)
      .single();

    if (fetchError) throw fetchError;
    if (!operation) throw new Error('Operation not found');

    // Validar comprobante
    if (!this.validateReceipt(receipt)) {
      throw new Error('Invalid or incomplete receipt');
    }

    const newStep: OperationStep = {
      step: 'FUNDS_RECEPTION',
      date: new Date(),
      status: 'COMPLETED',
      details: 'Funds received and verified',
      receipt
    };

    const { data: updatedOperation, error: updateError } = await supabase
      .from('custody_operations')
      .update({
        status: 'FUNDS_RECEIVED',
        steps: [...operation.steps, newStep],
        updatedAt: new Date()
      })
      .eq('id', operationId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedOperation;
  }

  async processCompanyTransfer(operationId: string): Promise<CustodyOperation> {
    const { data: operation, error: fetchError } = await supabase
      .from('custody_operations')
      .select()
      .eq('id', operationId)
      .single();

    if (fetchError) throw fetchError;
    if (!operation) throw new Error('Operation not found');

    try {
      // Realizar transferencia bancaria
      await this.performTransfer({
        sourceAccount: operation.sourceAccountId,
        targetAccount: operation.targetAccountId,
        amount: operation.targetAmount,
        concept: `OP_${operationId}`
      });

      const newStep: OperationStep = {
        step: 'COMPANY_TRANSFER',
        date: new Date(),
        status: 'COMPLETED',
        details: 'Transfer completed successfully'
      };

      const { data: updatedOperation, error: updateError } = await supabase
        .from('custody_operations')
        .update({
          status: 'COMPLETED',
          steps: [...operation.steps, newStep],
          updatedAt: new Date()
        })
        .eq('id', operationId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Actualizar saldos
      await this.updateAccountBalances(operation);

      return updatedOperation;
    } catch (error) {
      const errorStep: OperationStep = {
        step: 'COMPANY_TRANSFER',
        date: new Date(),
        status: 'ERROR',
        details: error.message
      };

      const { data: failedOperation } = await supabase
        .from('custody_operations')
        .update({
          status: 'FAILED',
          steps: [...operation.steps, errorStep],
          updatedAt: new Date()
        })
        .eq('id', operationId)
        .select()
        .single();

      throw error;
    }
  }

  private async getExchangeRate(): Promise<ExchangeRate> {
    // Implementar lógica para obtener cotización
    return {
      buy: 950,
      sell: 970,
      date: new Date()
    };
  }

  private calculateTargetAmount(
    sourceAmount: number,
    operationType: 'BUY' | 'SELL',
    exchangeRate: ExchangeRate
  ): number {
    return operationType === 'BUY'
      ? sourceAmount * exchangeRate.buy
      : sourceAmount * exchangeRate.sell;
  }

  private async checkLimits(accountId: string, amount: number): Promise<boolean> {
    const { data: account, error } = await supabase
      .from('custody_accounts')
      .select('type, recentOperations')
      .eq('id', accountId)
      .single();

    if (error) throw error;

    // Verificar límite diario
    const today = new Date().toISOString().split('T')[0];
    const todayOperations = account.recentOperations.filter(
      op => op.date.split('T')[0] === today
    );
    const dailyTotal = todayOperations.reduce((sum, op) => sum + op.amount, 0);
    if (dailyTotal + amount > this.limits.daily[account.type]) {
      return false;
    }

    // Verificar límite mensual
    const currentMonth = new Date().getMonth();
    const monthOperations = account.recentOperations.filter(
      op => new Date(op.date).getMonth() === currentMonth
    );
    const monthlyTotal = monthOperations.reduce((sum, op) => sum + op.amount, 0);
    return monthlyTotal + amount <= this.limits.monthly[account.type];
  }

  private validateReceipt(receipt: string): boolean {
    // Implementar validación de comprobantes
    return true;
  }

  private async performTransfer(data: {
    sourceAccount: string;
    targetAccount: string;
    amount: number;
    concept: string;
  }): Promise<boolean> {
    // Implementar lógica de transferencia bancaria
    return true;
  }

  private async updateAccountBalances(operation: CustodyOperation): Promise<void> {
    // Actualizar cuenta origen
    const { error: sourceError } = await supabase
      .from('custody_accounts')
      .update({
        balance: supabase.rpc('decrement_balance', { amount: operation.sourceAmount }),
        recentOperations: supabase.raw('array_append(recentOperations, ?)', [{
          date: new Date(),
          type: 'DEBIT',
          amount: operation.sourceAmount,
          operationId: operation.id
        }])
      })
      .eq('id', operation.sourceAccountId);

    if (sourceError) throw sourceError;

    // Actualizar cuenta destino
    const { error: targetError } = await supabase
      .from('custody_accounts')
      .update({
        balance: supabase.rpc('increment_balance', { amount: operation.targetAmount }),
        recentOperations: supabase.raw('array_append(recentOperations, ?)', [{
          date: new Date(),
          type: 'CREDIT',
          amount: operation.targetAmount,
          operationId: operation.id
        }])
      })
      .eq('id', operation.targetAccountId);

    if (targetError) throw targetError;
  }

  async generateDailyReport(): Promise<DailyReport> {
    const today = new Date().toISOString().split('T')[0];
    const { data: operations, error } = await supabase
      .from('custody_operations')
      .select()
      .gte('createdAt', today);

    if (error) throw error;

    return {
      date: new Date(),
      totalOperations: operations.length,
      volumeARS: operations.reduce((sum, op) => 
        op.targetCurrency === 'ARS' ? sum + op.targetAmount : sum, 0
      ),
      volumeUSD: operations.reduce((sum, op) => 
        op.targetCurrency === 'USD' ? sum + op.targetAmount : sum, 0
      ),
      completedOperations: operations.filter(op => op.status === 'COMPLETED').length,
      pendingOperations: operations.filter(op => op.status === 'PENDING').length
    };
  }
}

export const custodyService = new CustodyService();
