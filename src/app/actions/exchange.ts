'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { ExchangeFormData, Currency, ExchangeTransaction } from '@/lib/exchange';

export async function handleExchangeAction(data: ExchangeFormData) {
  const cookieStore = cookies()
  
  const supabase = createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        }
      },
      db: { schema: 'public' }
    }
  );
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    const transaction: Omit<ExchangeTransaction, 'id' | 'created_at'> = {
      user_id: user.id,
      tipo: 'exchange',
      monto: data.amount,
      moneda_origen: (data.targetCurrency === 'ARS' ? 'USD' : 'ARS') as Currency,
      moneda_destino: data.targetCurrency,
      cuenta_bancaria: data.bankAccount || null,
      comprobante: data.comprobante,
      alias: data.alias,
      estado: 'pendiente'
    };

    const { error: transactionError } = await supabase
      .from('transacciones')
      .insert([transaction]);

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
