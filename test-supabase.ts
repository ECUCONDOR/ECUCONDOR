import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testSupabaseConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Intentar hacer una consulta simple
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error al consultar datos:', error)
      return
    }

    console.log('¡Conexión exitosa!')
    console.log('Datos recuperados:', data)

  } catch (error) {
    console.error('Error al conectar con Supabase:', error)
  }
}

console.log('Probando conexión con Supabase...')
console.log('URL:', supabaseUrl)
testSupabaseConnection()
