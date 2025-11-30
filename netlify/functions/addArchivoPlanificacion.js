import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const {
    planificacion_id,
    archivo_url,
    tipo_archivo,
    titulo,
    descripcion
  } = JSON.parse(event.body || "{}");

  if (!planificacion_id || !archivo_url) {
    return { statusCode: 400, body: "Faltan campos obligatorios" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO planificacion_archivos (planificacion_id, archivo_url, tipo_archivo, titulo, descripcion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await client.query(query, [
      planificacion_id,
      archivo_url,
      tipo_archivo || null,
      titulo || null,
      descripcion || null
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Archivo agregado",
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
