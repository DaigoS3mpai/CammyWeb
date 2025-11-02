// netlify/functions/addImagen.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { imagen_url, descripcion, proyecto_id, clase_id, tipo } = JSON.parse(event.body || "{}");

  // ✅ Validación básica
  if (!imagen_url || (!proyecto_id && !clase_id)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error:
          "Faltan campos obligatorios: se necesita 'imagen_url' y al menos 'proyecto_id' o 'clase_id'.",
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
        error: "La URL no pertenece a Cloudinary o es inválida.",
      }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ✅ Insertar según el tipo de relación
    const query = `
      INSERT INTO galeria (imagen_url, descripcion, proyecto_id, clase_id, tipo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, imagen_url, descripcion, proyecto_id, clase_id, tipo;
    `;

    const values = [
      imagen_url,
      descripcion || null,
      proyecto_id || null,
      clase_id || null,
      tipo || (imagen_url.match(/\.(mp4|webm|mov)$/i) ? "video" : "imagen"),
    ];

    const result = await client.query(query, values);
    const nuevaImagen = result.rows[0];

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Multimedia guardado correctamente en la base de datos.",
        imagen: nuevaImagen,
      }),
    };
  } catch (err) {
    console.error("❌ Error al guardar imagen/video:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
