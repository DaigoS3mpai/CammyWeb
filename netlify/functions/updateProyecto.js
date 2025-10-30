import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion, fecha_inicio, imagen_portada } = JSON.parse(event.body || "{}");

  // Validar ID
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el ID del proyecto" }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const updateQuery = `
      UPDATE proyectos
      SET 
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        fecha_inicio = COALESCE($3, fecha_inicio),
        imagen_portada = COALESCE($4, imagen_portada)
      WHERE id = $5
      RETURNING *;
    `;

    const result = await client.query(updateQuery, [
      titulo || null,
      descripcion || null,
      fecha_inicio || null,
      imagen_portada || null,
      id,
    ]);

    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Proyecto no encontrado" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Proyecto actualizado correctamente",
        proyecto: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al actualizar proyecto:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
