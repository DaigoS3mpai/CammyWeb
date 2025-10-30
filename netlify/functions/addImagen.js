// netlify/functions/addImagen.js
import { Client } from "pg";

export const handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  // Leer datos del cuerpo de la solicitud
  const { imagen_url, descripcion, proyecto_id } = JSON.parse(event.body);

  // Validar campos requeridos
  if (!imagen_url || !proyecto_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Los campos 'imagen_url' y 'proyecto_id' son obligatorios.",
      }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO galeria (imagen_url, descripcion, proyecto_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [imagen_url, descripcion || null, proyecto_id];
    const result = await client.query(query, values);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Imagen agregada correctamente",
        imagen: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al agregar imagen:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
