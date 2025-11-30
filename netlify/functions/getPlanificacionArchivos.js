import { Client } from "pg";

export const handler = async (event) => {
  // Solo aceptar POST (como lo usas en el frontend)
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Método no permitido",
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido" }),
    };
  }

  const { planificacion_id } = body;

  if (!planificacion_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Falta 'planificacion_id' en la solicitud",
      }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      SELECT
        id,
        planificacion_id,
        archivo_url,
        tipo_archivo,
        titulo,
        descripcion
      FROM planificacion_archivos
      WHERE planificacion_id = $1
      ORDER BY id ASC;
    `;

    const result = await client.query(query, [planificacion_id]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows || []),
    };
  } catch (err) {
    console.error("❌ Error en getPlanificacionArchivos:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    try {
      await client.end();
    } catch {}
  }
};
