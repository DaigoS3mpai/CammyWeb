import { Client } from "pg";

export const handler = async (event) => {
  // Solo permite método PUT
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion, fecha, proyecto_id } = JSON.parse(event.body || "{}");

  // Validación básica
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

    // 🔹 Si se incluye un proyecto_id, validamos que exista
    let proyectoValido = null;
    if (proyecto_id) {
      const checkProyecto = await client.query("SELECT id FROM proyectos WHERE id = $1", [proyecto_id]);
      if (checkProyecto.rows.length > 0) {
        proyectoValido = proyecto_id;
      } else {
        console.warn("⚠️ Proyecto no encontrado, se ignorará vínculo");
      }
    }

    // 🔹 Actualizamos la clase
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

    const result = await client.query(updateQuery, [
      titulo || null,
      descripcion || null,
      fecha || null,
      proyectoValido,
      id,
    ]);

    if (result.rows.length === 0) {
      await client.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Clase no encontrada" }),
      };
    }

    // 🔹 Si la clase tiene proyecto, traemos el título del proyecto
    let clase = result.rows[0];
    if (clase.proyecto_id) {
      const proyecto = await client.query(
        "SELECT titulo FROM proyectos WHERE id = $1",
        [clase.proyecto_id]
      );
      clase.proyecto_titulo = proyecto.rows[0]?.titulo || "Proyecto desconocido";
    } else {
      clase.proyecto_titulo = null;
    }

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Clase actualizada correctamente",
        clase,
      }),
    };
  } catch (err) {
    console.error("❌ Error al actualizar clase:", err);
    await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
