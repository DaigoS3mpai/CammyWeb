// netlify/functions/getClases.js
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
        b.id,
        b.titulo,
        b.descripcion,
        b.fecha,
        b.proyecto_id,          -- 🆕 Incluimos el ID del proyecto vinculado
        p.titulo AS proyecto_titulo
      FROM bitacora b
      LEFT JOIN proyectos p ON b.proyecto_id = p.id
      ORDER BY b.fecha DESC NULLS LAST, b.id DESC;
    `;

    const result = await client.query(query);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows || []),
    };
  } catch (err) {
    console.error("❌ Error al obtener bitácora:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.end().catch(() => {});
  }
};
