// netlify/functions/addProyecto.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { titulo, descripcion, fecha_inicio } = JSON.parse(event.body);

  if (!titulo) {
    return { statusCode: 400, body: "El campo 'titulo' es obligatorio" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      `INSERT INTO proyectos (titulo, descripcion, fecha_inicio)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [titulo, descripcion || null, fecha_inicio || new Date()]
    );

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Proyecto creado correctamente ✅",
        proyecto: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al crear proyecto:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
