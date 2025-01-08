import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface StatsUpdate {
  user_id: string;
  balance_change?: number;
  active_time_seconds?: number;
}

serve(async (req) => {
  try {
    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401 }
      )
    }

    // Obtener datos de actualización
    const { user_id, balance_change = 0, active_time_seconds = 0 } = 
      await req.json() as StatsUpdate

    // Obtener estadísticas actuales
    const { data: stats, error: statsError } = await supabaseClient
      .from('client_stats')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (statsError) {
      throw statsError
    }

    // Preparar actualización
    const updates: any = {
      transaction_count: stats.transaction_count + (balance_change !== 0 ? 1 : 0)
    }

    // Actualizar balance si hay cambio
    if (balance_change !== 0) {
      updates.balance = stats.balance + balance_change
    }

    // Actualizar tiempo activo si se proporciona
    if (active_time_seconds > 0) {
      updates.active_time = `${stats.active_time.seconds + active_time_seconds} seconds`
    }

    // Realizar actualización
    const { error: updateError } = await supabaseClient
      .from('client_stats')
      .update(updates)
      .eq('user_id', user_id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, updates }),
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
