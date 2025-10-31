import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion, fecha, proyecto_id } = JSON.parse(event.body || "{}");

  // 🔹 Validación básica
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el ID de la clase" }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // 🔹 Actualizar clase
    const updateQuery = `
      UPDATE bitacora
      SET
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        fecha = COALESCE($3, fecha),
        proyecto_id = $4
      WHERE id = $5
      RETURNING *;
    `;

    const values = [
      titulo || null,
      descripcion || null,
      fecha || null,
      proyecto_id || null,
      id,
    ];

    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      await client.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Clase no encontrada" }),
      };
    }

    const updatedClass = result.rows[0];

    // 🔹 Traer nombre del proyecto vinculado (si existe)
    const projectQuery = `
      SELECT titulo FROM proyectos WHERE id = $1;
    `;
    let proyectoTitulo = null;

    if (updatedClass.proyecto_id) {
      const projectResult = await client.query(projectQuery, [updatedClass.proyecto_id]);
      proyectoTitulo = projectResult.rows[0]?.titulo || null;
    }

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Clase actualizada correctamente",
        clase: {
          ...updatedClass,
          proyecto_titulo: proyectoTitulo,
        },
      }),
    };
  } catch (err) {
    console.error("❌ Error al actualizar clase:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
