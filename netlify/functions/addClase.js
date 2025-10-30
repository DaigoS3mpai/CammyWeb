// netlify/functions/addClase.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { titulo, descripcion, fecha, proyecto_id } = JSON.parse(event.body);

  if (!titulo || !descripcion || !fecha || !proyecto_id) {
    return { statusCode: 400, body: "Faltan campos requeridos" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO bitacora (titulo, descripcion, fecha, proyecto_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [titulo, descripcion, fecha, proyecto_id];
    const result = await client.query(query, values);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Clase registrada correctamente ✅",
        clase: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al registrar clase:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
