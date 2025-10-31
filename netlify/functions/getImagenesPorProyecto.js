// netlify/functions/getImagenesPorProyecto.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const proyectoId = event.queryStringParameters?.id;
  if (!proyectoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el parámetro 'id' del proyecto" }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        p.id AS proyecto_id,
        p.titulo AS proyecto_titulo,
        p.descripcion AS proyecto_descripcion,
        p.fecha_inicio,
        g.id AS imagen_id,
        g.imagen_url,
        g.descripcion AS imagen_descripcion
      FROM proyectos p
      LEFT JOIN galeria g ON g.proyecto_id = p.id
      WHERE p.id = $1
      ORDER BY g.id DESC;
    `;

    const result = await client.query(query, [proyectoId]);
    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Proyecto no encontrado o sin imágenes." }),
      };
    }

    const proyecto = {
      id: result.rows[0].proyecto_id,
      titulo: result.rows[0].proyecto_titulo,
      descripcion: result.rows[0].proyecto_descripcion,
      fecha_inicio: result.rows[0].fecha_inicio,
      imagenes: result.rows
        .filter((r) => r.imagen_url)
        .map((r) => ({
          id: r.imagen_id,
          url: r.imagen_url,
          descripcion: r.imagen_descripcion,
        })),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(proyecto),
    };
  } catch (err) {
    console.error("❌ Error al obtener imágenes del proyecto:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
