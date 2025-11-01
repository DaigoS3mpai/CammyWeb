import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion, fecha_inicio, imagen_portada } = JSON.parse(event.body || "{}");

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Falta el ID del proyecto" }) };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // 🔹 Actualizar proyecto
    const result = await client.query(
      `
      UPDATE proyectos
      SET titulo = COALESCE($1, titulo),
          descripcion = COALESCE($2, descripcion),
          fecha_inicio = COALESCE($3, fecha_inicio),
          imagen_portada = COALESCE($4, imagen_portada)
      WHERE id = $5
      RETURNING *;
      `,
      [titulo || null, descripcion || null, fecha_inicio || null, imagen_portada || null, id]
    );

    if (result.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Proyecto no encontrado" }) };
    }

    const updatedProyecto = result.rows[0];

    // 🔹 Recalcular conteos relacionados
    const claseCountRes = await client.query(
      `SELECT COUNT(*) AS count FROM bitacora WHERE proyecto_id = $1;`,
      [id]
    );
    const imagenCountRes = await client.query(
      `SELECT COUNT(*) AS count FROM galeria WHERE proyecto_id = $1;`,
      [id]
    );

    const claseCount = parseInt(claseCountRes.rows[0].count || 0, 10);
    const imagenCount = parseInt(imagenCountRes.rows[0].count || 0, 10);

    // 🔹 Guardar conteos
    await client.query(
      `UPDATE proyectos SET clase_count = $1, imagen_count = $2 WHERE id = $3;`,
      [claseCount, imagenCount, id]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Proyecto actualizado correctamente",
        proyecto: {
          ...updatedProyecto,
          clase_count: claseCount,
          imagen_count: imagenCount,
        },
      }),
    };
  } catch (err) {
    console.error("❌ Error al actualizar proyecto:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.end().catch(() => {});
  }
};
