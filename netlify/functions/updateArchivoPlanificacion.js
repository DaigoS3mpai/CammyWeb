import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion } = JSON.parse(event.body || "{}");

  if (!id) {
    return { statusCode: 400, body: "Falta ID del archivo" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      UPDATE planificacion_archivos
      SET titulo = COALESCE($1, titulo),
          descripcion = COALESCE($2, descripcion)
      WHERE id = $3
      RETURNING *;
    `;

    const result = await client.query(query, [
      titulo || null,
      descripcion || null,
      id
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Archivo actualizado",
        data: result.rows[0]
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    client.end();
  }
};
