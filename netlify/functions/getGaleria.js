// netlify/functions/getGaleria.js
import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        g.id,
        g.imagen_url,
        g.descripcion,
        g.proyecto_id,
        p.titulo AS proyecto_titulo,
        g.created_at
      FROM galeria g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      ORDER BY g.created_at DESC NULLS LAST, g.id DESC;
    `;

    const result = await client.query(query);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows || []),
    };
  } catch (err) {
    console.error("❌ Error al obtener galería:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.end().catch(() => {});
  }
};
