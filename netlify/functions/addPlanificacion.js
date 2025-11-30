import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const {
    titulo,
    descripcion,
    imagen_portada,
    proyecto_id
  } = JSON.parse(event.body || "{}");

  if (!titulo) {
    return { statusCode: 400, body: "Falta título" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO planificacion (titulo, descripcion, imagen_portada, proyecto_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await client.query(query, [
      titulo,
      descripcion || null,
      imagen_portada || null,
      proyecto_id || null
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Planificación creada",
        data: result.rows[0]
      })
    };
  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    client.end();
  }
};
