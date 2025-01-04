'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { ExchangeFormData, Currency } from '@/lib/exchange';

export async function handleExchangeAction(data: ExchangeFormData) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    const { error: transactionError } = await supabase
      .from('transacciones')
      .insert([{
        user_id: user.id,
        tipo: 'exchange',
        monto: data.amount,
        moneda_origen: (data.targetCurrency === 'ARS' ? 'USD' : 'ARS') as Currency,
        moneda_destino: data.targetCurrency,
        cuenta_bancaria: data.bankAccount || null,
        comprobante: data.comprobante,
        alias: data.alias,
        estado: 'pendiente'
      }]);

    if (transactionError) throw transactionError;

    return { success: true, error: null } as const;
  } catch (error) {
    console.error('Error in handleExchangeAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as const;
  }
}
