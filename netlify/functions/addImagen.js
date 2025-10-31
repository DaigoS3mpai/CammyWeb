// netlify/functions/addImagen.js
import { Client } from "pg";

export const handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  // Leer datos del cuerpo de la solicitud
  const { imagen_url, descripcion, proyecto_id } = JSON.parse(event.body || "{}");

  // ✅ Validar campos requeridos
  if (!imagen_url || !proyecto_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Los campos 'imagen_url' y 'proyecto_id' son obligatorios.",
      }),
    };
  }

  // ✅ Validar que la URL sea de Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const validUrlPattern = new RegExp(`https://res\\.cloudinary\\.com/${cloudName}/`, "i");

  if (!validUrlPattern.test(imagen_url)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "La URL de la imagen no es válida o no pertenece a Cloudinary.",
      }),
    };
  }

  // ✅ Conectar a Neon
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ✅ Insertar registro en tabla galeria
    const query = `
      INSERT INTO galeria (imagen_url, descripcion, proyecto_id)
      VALUES ($1, $2, $3)
      RETURNING id, imagen_url, descripcion, proyecto_id;
    `;

    const values = [imagen_url, descripcion || null, proyecto_id];
    const result = await client.query(query, values);
    const nuevaImagen = result.rows[0];

    await client.end();

    // ✅ Responder con éxito
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Imagen guardada correctamente en la base de datos.",
        imagen: nuevaImagen,
      }),
    };
  } catch (err) {
    console.error("❌ Error al guardar imagen:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
