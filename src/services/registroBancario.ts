import { supabase } from '@/lib/supabase'
import type { RegistroBancarioType } from '@/types/registroBancario.types'

export const crearRegistroBancario = async (datos: RegistroBancarioType) => {
  try {
    const { data, error } = await supabase
      .from('registros_bancarios')
      .insert([datos])
      .single()

    if (error) throw error
    return data

  } catch (error) {
    console.error('Error al crear registro:', error)
    throw error
  }
}

export const obtenerRegistros = async () => {
  try {
    const { data, error } = await supabase
      .from('registros_bancarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data

  } catch (error) {
    console.error('Error al obtener registros:', error)
    throw error
  }
}
