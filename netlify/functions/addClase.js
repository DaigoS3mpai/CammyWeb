import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { titulo, descripcion, fecha, proyecto_id } = JSON.parse(event.body || "{}");

  if (!titulo || !fecha) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios: título o fecha" }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Si se pasa proyecto_id, verificar que exista
    let proyectoValido = null;
    if (proyecto_id) {
      const check = await client.query("SELECT id FROM proyectos WHERE id = $1", [proyecto_id]);
      proyectoValido = check.rows.length > 0 ? proyecto_id : null;
    }

    const result = await client.query(
      `
      INSERT INTO bitacora (titulo, descripcion, fecha, proyecto_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [titulo, descripcion || null, fecha, proyectoValido]
    );

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Clase creada correctamente",
        clase: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al crear clase:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
