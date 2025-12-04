// ⚠️ IMPORTANTE:
// Usa el MISMO helper de conexión que en addPlanificacion.js.
// Si en tu proyecto usas `const { getClient } = require("./db");` deja esto tal cual.
// Si usas `pool` directamente, cambia getClient() por pool.

const { getClient } = require("./db");

exports.handler = async (event) => {
  // Solo permitimos POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    console.log("📥 Body recibido en updatePlanificacion:", body);

    const { id, titulo, descripcion } = body;

    if (!id || !titulo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Faltan campos obligatorios (id, titulo).",
        }),
      };
    }

    const client = await getClient(); // si usas pool, cambia esta línea

    // Tabla y columnas según tu screenshot:
    // TABLE public.planificacion (id, titulo, descripcion, fecha, imagen_portada, proyecto_id)
    const query = `
      UPDATE planificacion
      SET titulo = $1,
          descripcion = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [titulo, descripcion || null, id];

    const result = await client.query(query, values);
    client.release?.(); // si usas pool con connect(), esto libera el cliente

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Planificación no encontrada." }),
      };
    }

    console.log("✅ Planificación actualizada:", result.rows[0]);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    console.error("❌ Error en updatePlanificacion:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al actualizar planificación.",
        error: err.message,
      }),
    };
  }
};
