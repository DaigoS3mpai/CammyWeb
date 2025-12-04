// 👇 Usa exactamente los mismos imports que en addPlanificacion.js
const { getClient } = require("./db");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { id, titulo, descripcion } = JSON.parse(event.body);

    if (!id || !titulo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Faltan campos obligatorios." }),
      };
    }

    const client = await getClient();

    // AJUSTA el nombre de la tabla y columnas según tu BD:
    const query = `
      UPDATE planificacion
      SET titulo = $1,
          descripcion = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [titulo, descripcion || null, id];

    const result = await client.query(query, values);
    client.release?.();

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Planificación no encontrada." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    console.error("Error en updatePlanificacion:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al actualizar planificación." }),
    };
  }
};
