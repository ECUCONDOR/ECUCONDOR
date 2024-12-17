import { Client } from 'pg';

const connectionString = "postgres://postgres:ecucondor0812@db.keypzybcaayazkcivocz.supabase.co:5432/postgres";

async function testConnection() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Necesario para conexiones SSL a Supabase
    }
  });

  try {
    console.log('Intentando conectar a la base de datos...');
    await client.connect();
    console.log('¡Conexión exitosa!');

    // Intentar hacer una consulta simple
    const result = await client.query('SELECT NOW()');
    console.log('Consulta exitosa:', result.rows[0]);

    // Intentar consultar la tabla de usuarios
    const users = await client.query('SELECT * FROM "User" LIMIT 1');
    console.log('Usuarios encontrados:', users.rows);

  } catch (error) {
    console.error('Error al conectar:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

testConnection();
