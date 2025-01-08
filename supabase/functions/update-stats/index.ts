import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Transaction {
  amount: number;
  client_id: string;
  created_at: string;
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verificar autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401 }
      )
    }

    // Obtener datos de la transacción
    const { transaction } = await req.json() as { transaction: Transaction }
    const { client_id, amount, created_at } = transaction

    // Obtener estadísticas actuales del cliente
    const { data: currentStats, error: statsError } = await supabaseClient
      .from('client_stats')
      .select('*')
      .eq('client_id', client_id)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError
    }

    // Calcular nuevo balance y actualizar historial
    const newBalance = (currentStats?.balance || 0) + amount
    const balanceHistory = currentStats?.balance_history || []
    const newHistoryEntry = {
      month: new Date(created_at).toLocaleString('es-ES', { month: 'short' }),
      balance: newBalance
    }

    // Actualizar o crear estadísticas del cliente
    const { error: updateError } = await supabaseClient
      .from('client_stats')
      .upsert({
        client_id,
        balance: newBalance,
        transaction_count: (currentStats?.transaction_count || 0) + 1,
        balance_history: [...balanceHistory, newHistoryEntry]
      })

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
