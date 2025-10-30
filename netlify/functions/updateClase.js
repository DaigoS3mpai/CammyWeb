import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion, fecha } = JSON.parse(event.body || "{}");

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Falta el ID de la clase" }) };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const updateQuery = `
      UPDATE bitacora
      SET 
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        fecha = COALESCE($3, fecha)
      WHERE id = $4
      RETURNING *;
    `;

    const result = await client.query(updateQuery, [
      titulo || null,
      descripcion || null,
      fecha || null,
      id,
    ]);

    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Clase no encontrada" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Clase actualizada correctamente",
        clase: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al actualizar clase:", err);
    await client.end();
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
