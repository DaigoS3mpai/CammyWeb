import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, descripcion } = JSON.parse(event.body || "{}");
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Falta el ID de la imagen" }) };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query(
      `
      UPDATE galeria
      SET descripcion = COALESCE($1, descripcion)
      WHERE id = $2
      RETURNING *;
    `,
      [descripcion || null, id]
    );

    await client.end();
    if (result.rows.length === 0)
      return { statusCode: 404, body: JSON.stringify({ error: "Imagen no encontrada" }) };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Imagen actualizada correctamente",
        imagen: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
