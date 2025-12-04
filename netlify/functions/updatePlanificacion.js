// src/netlify/functions/updatePlanificacion.js
import { Client } from "pg";

export const handler = async (event, context) => {
  // Solo aceptamos POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("📥 Body recibido en updatePlanificacion:", body);

    const { id, titulo, descripcion } = body;

    if (!id || !titulo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Faltan campos obligatorios (id, titulo).",
        }),
      };
    }

    // Igual que en tu db.js
    const client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // necesario para Neon
      },
    });

    await client.connect();

    // Tabla y columnas según tu captura:
    // public.planificacion (id, titulo, descripcion, fecha, imagen_portada, proyecto_id)
    const query = `
      UPDATE planificacion
      SET titulo = $1,
          descripcion = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [titulo, descripcion || null, id];

    const result = await client.query(query, values);

    await client.end();

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Planificación no encontrada." }),
      };
    }

    console.log("✅ Planificación actualizada:", result.rows[0]);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error("❌ Error en updatePlanificacion:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al actualizar planificación.",
        error: error.message,
      }),
    };
  }
};
