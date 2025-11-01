import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { id, titulo, descripcion, fecha, proyecto_id } = JSON.parse(event.body || "{}");

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

    // 🔹 Obtener proyecto anterior (para actualizar conteos si cambió)
    const prev = await client.query(`SELECT proyecto_id FROM bitacora WHERE id = $1`, [id]);
    const prevProyectoId = prev.rows[0]?.proyecto_id || null;

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
      proyecto_id === "" ? null : proyecto_id,
      id,
    ];

    const result = await client.query(updateQuery, values);
    if (result.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Clase no encontrada" }) };
    }

    const updatedClass = result.rows[0];

    // 🔹 Obtener título del proyecto vinculado (si existe)
    let proyectoTitulo = null;
    if (updatedClass.proyecto_id) {
      const projectRes = await client.query(
        `SELECT titulo FROM proyectos WHERE id = $1`,
        [updatedClass.proyecto_id]
      );
      proyectoTitulo = projectRes.rows[0]?.titulo || null;
    }

    // 🔹 Recalcular conteos si cambió el proyecto
    if (prevProyectoId !== updatedClass.proyecto_id) {
      if (prevProyectoId) {
        await client.query(`
          UPDATE proyectos p
          SET clase_count = (
            SELECT COUNT(*) FROM bitacora b WHERE b.proyecto_id = p.id
          )
          WHERE p.id = $1;
        `, [prevProyectoId]);
      }

      if (updatedClass.proyecto_id) {
        await client.query(`
          UPDATE proyectos p
          SET clase_count = (
            SELECT COUNT(*) FROM bitacora b WHERE b.proyecto_id = p.id
          )
          WHERE p.id = $1;
        `, [updatedClass.proyecto_id]);
      }
    }

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
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.end().catch(() => {});
  }
};
