import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  let bodyData = {};
  try {
    bodyData = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Cuerpo JSON inválido en la solicitud." }),
    };
  }

  const { id, titulo, descripcion } = bodyData;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el 'id' de la imagen." }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      UPDATE galeria
      SET
        titulo = $1,
        descripcion = $2
      WHERE id = $3
      RETURNING id, titulo, descripcion, imagen_url, proyecto_id, clase_id, tipo;
    `;

    const values = [titulo || null, descripcion || null, id];

    const result = await client.query(query, values);
    const updated = result.rows?.[0] || null;

    if (!updated) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Imagen no encontrada." }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "✅ Imagen actualizada correctamente.",
        imagen: updated,
      }),
    };
  } catch (err) {
    console.error("❌ Error al actualizar imagen:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Error interno al actualizar la imagen.",
      }),
    };
  } finally {
    try {
      await client.end();
    } catch (closeErr) {
      console.warn(
        "⚠️ Error al cerrar conexión con la base de datos:",
        closeErr.message
      );
    }
  }
};
