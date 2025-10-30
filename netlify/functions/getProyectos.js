// netlify/functions/getProyectos.js
import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ✅ Consulta principal con subquery JSON agregada
    const result = await client.query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.fecha_inicio,
        p.imagen_portada,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', g.id,
                'imagen_url', g.imagen_url,
                'descripcion', g.descripcion
              )
            )
            FROM galeria g
            WHERE g.proyecto_id = p.id
          ), '[]'
        ) AS imagenes
      FROM proyectos p
      ORDER BY p.id DESC;
    `);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error("❌ Error al obtener proyectos:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
