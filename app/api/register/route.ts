import { NextResponse } from 'next/server';
import { Pool } from 'pg'; // Usar pg para conectar con PostgreSQL

// Crear una conexión a la base de datos
const pool = new Pool({
  user: process.env.DB_USER, // Usar variables de entorno
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extraer el archivo y los campos del formulario
    const file = formData.get('receipt') as File;
    const amountUSD = formData.get('amountUSD') as string;
    const amountARS = formData.get('amountARS') as string;
    const beneficiaryName = formData.get('beneficiaryName') as string;
    const cbuOrAlias = formData.get('cbuOrAlias') as string;
    const bank = formData.get('bank') as string;

    if (file) {
      // Convertir el archivo a un Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear un nombre único para el archivo (esto es opcional)
      const originalName = file.name;

      // Insertar en la base de datos
      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO receipts (amount_usd, amount_ars, beneficiary_name, cbu_or_alias, bank, file_data, file_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `;
        const values = [parseFloat(amountUSD), parseFloat(amountARS), beneficiaryName, cbuOrAlias, bank, buffer, originalName];
        const result = await client.query(query, values);

        // Obtener el ID de la fila insertada para devolverlo como referencia
        const receiptId = result.rows[0].id;

        return NextResponse.json({ success: true, receiptId });
      } finally {
        client.release(); // Asegurarse de liberar el cliente después de la consulta
      }
    } else {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al procesar el registro:', error);
    return NextResponse.json(
      { error: 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}
