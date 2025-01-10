import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

// Define more specific types for our database operations
type Tables = Database['public']['Tables']
type ClientInsert = Tables['clients']['Insert']
type UserClientRelationRow = Tables['user_client_relation']['Row']

// Helper function to create a properly typed Supabase client
function createTypedClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

// Helper function to get authenticated user
async function getAuthUser() {
  const supabase = createTypedClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(`Error de autenticación: ${error.message}`)
  }
  if (!user) {
    throw new Error('No se encontró usuario autenticado')
  }
  
  return user
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = createTypedClient()
    const user = await getAuthUser()
    
    const formData = await request.json()
    
    // Validate required fields with proper typing
    const requiredFields = ['first_name', 'last_name', 'identification', 'email'] as const
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes', details: `Falta: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const clientData: ClientInsert = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      identification: formData.identification,
      email: formData.email,
      phone: formData.phone ?? null,
      address: formData.address ?? null,
      created_by: user.id,
    }

    // Check for existing client with proper error handling
    const { data: existingClient, error: searchError } = await supabase
      .from('clients')
      .select()
      .eq('identification', formData.identification)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      throw new Error(`Error al buscar cliente existente: ${searchError.message}`)
    }

    if (existingClient) {
      return NextResponse.json(
        { error: 'Cliente ya existe', details: 'Ya existe un cliente con esta identificación' },
        { status: 400 }
      )
    }

    // Create new client with proper typing
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (insertError) {
      throw new Error(`Error al crear el cliente: ${insertError.message}`)
    }

    // Create user-client relation with proper typing
    if (newClient) {
      const relationData: Omit<UserClientRelationRow, 'id'> = {
        user_id: user.id,
        client_id: newClient.id,
      }

      const { error: relationError } = await supabase
        .from('user_client_relation')
        .insert(relationData)

      if (relationError) {
        // Rollback client creation if relation fails
        await supabase.from('clients').delete().eq('id', newClient.id)
        throw new Error(`Error al crear relación usuario-cliente: ${relationError.message}`)
      }
    }

    return NextResponse.json(newClient)
  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createTypedClient()
    const user = await getAuthUser()

    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        user_client_relation!inner(*)
      `)
      .eq('user_client_relation.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`)
    }

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
