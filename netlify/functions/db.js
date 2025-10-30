// src/netlify/functions/db.js
import { Client } from 'pg';

export const handler = async (event, context) => {
  // Usa la variable que Netlify ya configuró
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Necesario para Neon
    },
  });

  try {
    await client.connect();

    // Prueba simple: obtiene la fecha actual del servidor
    const result = await client.query('SELECT NOW() AS server_time;');

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Conexión exitosa a Neon',
        server_time: result.rows[0].server_time,
      }),
    };
  } catch (error) {
    console.error('❌ Error al conectar con Neon:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
