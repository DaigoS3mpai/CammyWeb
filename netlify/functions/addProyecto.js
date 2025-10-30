import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { titulo, descripcion, fecha_inicio, imagen_portada } = JSON.parse(event.body || "{}");

  // 🧠 Validación básica
  if (!titulo || !fecha_inicio) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios (título o fecha)" }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ✅ Insertar proyecto y devolver su ID
    const insertQuery = `
      INSERT INTO proyectos (titulo, descripcion, fecha_inicio, imagen_portada)
      VALUES ($1, $2, $3, $4)
      RETURNING id, titulo, descripcion, fecha_inicio, imagen_portada;
    `;

    const result = await client.query(insertQuery, [
      titulo,
      descripcion || null,
      fecha_inicio,
      imagen_portada || null,
    ]);

    const nuevoProyecto = result.rows[0];

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Proyecto creado correctamente",
        proyecto: nuevoProyecto,
      }),
    };
  } catch (err) {
    console.error("❌ Error al crear proyecto:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
