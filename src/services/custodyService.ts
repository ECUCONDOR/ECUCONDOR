import { supabase } from './supabase';
import { 
  CurrencyType,
  ExchangeRate,
  OperationStep
} from '@/types/custody';

interface CustodyOperation {
  id?: string;
  timestamp: string;
  amount: number;
  type: string;
  sourceAmount?: number;
  targetAmount?: number;
  sourceAccountId?: string;
  targetAccountId?: string;
}

interface CustodyAccount {
  id: string;
  bank: string;
  accountNumber: string;
  cbu: string;
  type: string;
  alias?: string;
  dailyLimit: number;
  monthlyLimit: number;
  recentOperations: CustodyOperation[];
}

interface CustodyAccountData extends Omit<CustodyAccount, 'id'> {
  owner?: string;
  ownerDocument?: string;
  balance?: number;
  status?: string;
  createdAt?: Date;
}

interface CustodyOperationData extends Omit<CustodyOperation, 'id'> {
  sourceCurrency?: string;
  targetCurrency?: string;
  exchangeRate?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  steps?: OperationStep[];
}

class CustodyError extends Error {
  constructor(public message: string, public details?: unknown) {
    super(message);
    this.name = 'CustodyError';
  }
}

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
    const accountData: CustodyAccountData = {
      bank: data.bank,
      accountNumber: data.accountNumber,
      cbu: data.cbu,
      type: type,
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
      .insert([accountData])
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
      throw new CustodyError('Operation exceeds established limits');
    }

    const exchangeRate = await this.getExchangeRate();
    const targetAmount = this.calculateTargetAmount(
      data.sourceAmount,
      data.type,
      exchangeRate
    );

    const operationData: CustodyOperationData = {
      timestamp: new Date().toISOString(),
      amount: data.sourceAmount,
      type: data.type,
      sourceCurrency: data.sourceCurrency,
      targetCurrency: data.targetCurrency,
      sourceAmount: data.sourceAmount,
      targetAmount,
      exchangeRate: typeof exchangeRate === 'number' ? exchangeRate : exchangeRate.buy,
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
      .insert([operationData])
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
    if (!operation) throw new CustodyError('Operation not found');

    // Validar comprobante
    if (!this.validateReceipt(receipt)) {
      throw new CustodyError('Invalid or incomplete receipt');
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
    if (!operation) throw new CustodyError('Operation not found');

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
        details: error instanceof Error ? error.message : 'Unknown error'
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

  private async validateDailyLimit(account: CustodyAccount, amount: number): Promise<boolean> {
    try {
      const today = new Date();
      const todayOperations = account.recentOperations?.filter(op => {
        const opDate = new Date(op.timestamp);
        return opDate.toDateString() === today.toDateString();
      }) || [];

      const dailyTotal = todayOperations.reduce((sum, op) => sum + op.amount, 0);
      return (dailyTotal + amount) <= account.dailyLimit;
    } catch (error) {
      throw new CustodyError('Error validando límite diario', error);
    }
  }

  private async validateMonthlyLimit(account: CustodyAccount, amount: number): Promise<boolean> {
    try {
      const today = new Date();
      const monthOperations = account.recentOperations?.filter(op => {
        const opDate = new Date(op.timestamp);
        return opDate.getMonth() === today.getMonth() &&
               opDate.getFullYear() === today.getFullYear();
      }) || [];

      const monthlyTotal = monthOperations.reduce((sum, op) => sum + op.amount, 0);
      return (monthlyTotal + amount) <= account.monthlyLimit;
    } catch (error) {
      throw new CustodyError('Error validando límite mensual', error);
    }
  }

  private async checkLimits(accountId: string, amount: number): Promise<boolean> {
    try {
      const { data: account, error } = await supabase
        .from('custody_accounts')
        .select('type, recentOperations')
        .eq('id', accountId)
        .single();

      if (error) throw error;

      const withinDailyLimit = await this.validateDailyLimit(account as CustodyAccount, amount);
      if (!withinDailyLimit) return false;

      const withinMonthlyLimit = await this.validateMonthlyLimit(account as CustodyAccount, amount);
      return withinMonthlyLimit;
    } catch (error) {
      throw new CustodyError('Error checking limits', error);
    }
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
    const { data, error: sourceError } = await supabase
      .from('custody_accounts')
      .update({
        balance: supabase.rpc('decrement_balance', { amount: operation.sourceAmount }),
        recentOperations: supabase.rpc('append_operation', { 
          operation: {
            date: new Date(),
            type: 'DEBIT',
            amount: operation.sourceAmount,
            id: operation.id
          }
        })
      })
      .eq('id', operation.sourceAccountId);

    if (sourceError) throw sourceError;

    // Actualizar cuenta destino
    const { error: targetError } = await supabase
      .from('custody_accounts')
      .update({
        balance: supabase.rpc('increment_balance', { amount: operation.targetAmount }),
        recentOperations: supabase.rpc('append_operation', {
          operation: {
            date: new Date(),
            type: 'CREDIT',
            amount: operation.targetAmount,
            id: operation.id
          }
        })
      })
      .eq('id', operation.targetAccountId);

    if (targetError) throw targetError;
  }

  async generateDailyReport(): Promise<any> {
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

  async updateAccountOperations(accountId: string, operation: any) {
    try {
      const { data, error } = await supabase
        .from('custody_accounts')
        .update({
          recentOperations: operation
        })
        .eq('id', accountId);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new CustodyError('Error actualizando operaciones de la cuenta', error);
    }
  }
}

export const custodyService = new CustodyService();
