import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        g.id,
        g.imagen_url,
        g.descripcion,
        g.proyecto_id,
        g.clase_id,
        g.tipo,
        p.titulo AS proyecto_titulo,
        c.titulo AS clase_titulo
      FROM galeria g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      LEFT JOIN clases c ON g.clase_id = c.id
      ORDER BY g.id DESC;
    `;

    const result = await client.query(query);

    // 🔹 Garantizar siempre un array
    const rows = Array.isArray(result?.rows) ? result.rows : [];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error("❌ Error al obtener galería:", err.message);

    // 🔹 Respuesta segura incluso si hay error
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    };
  } finally {
    // 🔹 Cerrar conexión aunque haya error
    try {
      await client.end();
    } catch (closeErr) {
      console.warn("⚠️ Error al cerrar conexión con la base de datos:", closeErr.message);
    }
  }
};
