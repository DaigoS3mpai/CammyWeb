// netlify/functions/getProyectos.js
import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ✅ Consulta principal mejorada
    const result = await client.query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.fecha_inicio,
        p.imagen_portada,

        -- 🔹 Contador de clases vinculadas (desde bitácora)
        COUNT(DISTINCT b.id) AS clase_count,

        -- 🔹 Contador de imágenes vinculadas (desde galería)
        COUNT(DISTINCT g.id) AS imagen_count,

        -- 🔹 JSON con las imágenes del proyecto
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', g.id,
              'imagen_url', g.imagen_url,
              'descripcion', g.descripcion
            )
          ) FILTER (WHERE g.id IS NOT NULL),
          '[]'
        ) AS imagenes

      FROM proyectos p
      LEFT JOIN bitacora b ON b.proyecto_id = p.id
      LEFT JOIN galeria g ON g.proyecto_id = p.id
      GROUP BY p.id
      ORDER BY p.fecha_inicio DESC;
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
