import { Client } from "pg";

export const handler = async (event) => {
  // 🧩 Solo permitir POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  // 🧩 Parsear body de forma segura
  let bodyData = {};
  try {
    bodyData = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Cuerpo JSON inválido en la solicitud." }),
    };
  }

  const { imagen_url, descripcion, proyecto_id, clase_id, tipo } = bodyData;

  // ✅ Validación de campos obligatorios
  if (!imagen_url || (!proyecto_id && !clase_id)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error:
          "Faltan campos obligatorios: se necesita 'imagen_url' y al menos 'proyecto_id' o 'clase_id'.",
      }),
    };
  }

  // ✅ Validar que la URL sea de Cloudinary (más robusto)
  const envCloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ||
    process.env.REACT_APP_CLOUDINARY_CLOUDNAME; // por si acaso

  let validUrlPattern;

  if (envCloudName) {
    // ejemplo: https://res.cloudinary.com/tuCloudName/...
    validUrlPattern = new RegExp(
      `^https://res\\.cloudinary\\.com/${envCloudName}/`,
      "i"
    );
  } else {
    // si no tenemos cloudName en el backend, al menos validamos dominio
    validUrlPattern = /^https:\/\/res\.cloudinary\.com\//i;
  }

  if (!validUrlPattern.test(imagen_url)) {
    console.error("❌ URL rechazada por validación:", imagen_url);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error:
          "La URL no pertenece a Cloudinary o es inválida (revisar CLOUDINARY_CLOUD_NAME en Netlify).",
      }),
    };
  }

  // ✅ Detección del tipo de archivo (imagen o video)
  const fileType =
    tipo === "video" || tipo === "imagen"
      ? tipo
      : /\.(mp4|webm|mov|avi|mkv)$/i.test(imagen_url)
      ? "video"
      : "imagen";

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

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
      fileType,
    ];

    const result = await client.query(query, values);
    const nuevoRegistro = result.rows?.[0] || null;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "✅ Archivo multimedia guardado correctamente en la base de datos.",
        multimedia: nuevoRegistro,
      }),
    };
  } catch (err) {
    console.error("❌ Error al guardar multimedia:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Error interno al guardar el archivo multimedia.",
      }),
    };
  } finally {
    // 🔹 Cerrar conexión siempre
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
