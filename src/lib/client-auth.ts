import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'
import { invokeEdgeFunction } from './edge-functions'

export async function validateClientAccess() {
  const supabase = createClientComponentClient<Database>()
  
  try {
    // 1. Verificar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw new Error('Error de sesión: ' + sessionError.message)
    if (!session) throw new Error('No hay una sesión activa')

    // 2. Verificar relación cliente-usuario usando Edge Function
    const relationData = await invokeEdgeFunction('get-client-relation')
    
    if (!relationData?.client_id) {
      throw new Error('No hay un cliente asociado a este usuario')
    }

    if (relationData.status !== 'ACTIVE') {
      throw new Error(`La relación con el cliente está ${relationData.status.toLowerCase()}`)
    }

    // 3. Obtener datos del cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', relationData.client_id)
      .single()

    if (clientError) {
      console.error('Error al obtener datos del cliente:', clientError)
      throw new Error('Error al obtener información del cliente')
    }

    if (!clientData) {
      throw new Error('No se encontró la información del cliente')
    }

    return {
      session,
      client: clientData,
      clientId: relationData.client_id,
      status: relationData.status
    }
  } catch (error) {
    console.error('Error en validateClientAccess:', error)
    throw error
  }
}

export async function getClientData(clientId: string) {
  const supabase = createClientComponentClient<Database>()
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
      
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error al obtener datos del cliente:', error)
    throw error
  }
}
