import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { titulo, descripcion, fecha } = JSON.parse(event.body || "{}");

  if (!titulo || !fecha) {
    return { statusCode: 400, body: "Faltan campos obligatorios (titulo o fecha)" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ✅ Buscar automáticamente el último proyecto creado
    const proyectoResult = await client.query(
      "SELECT id FROM proyectos ORDER BY id DESC LIMIT 1;"
    );

    if (proyectoResult.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No hay proyectos creados aún." }),
      };
    }

    const proyecto_id = proyectoResult.rows[0].id;

    // ✅ Insertar la nueva clase vinculada al último proyecto
    const insertResult = await client.query(
      `INSERT INTO bitacora (titulo, descripcion, fecha, proyecto_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [titulo, descripcion || null, fecha, proyecto_id]
    );

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Clase creada correctamente",
        clase: insertResult.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error en addClase:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
