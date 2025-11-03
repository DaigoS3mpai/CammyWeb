import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🚀 Conectando a base de datos...");
    await client.connect();

    const result = await client.query(`
      SELECT 
        g.id,
        g.imagen_url,
        g.video_url,          -- ✅ nuevo campo
        g.descripcion,
        g.proyecto_id,
        g.clase_id,
        g.tipo,
        p.titulo AS proyecto_titulo,
        c.titulo AS clase_titulo
      FROM galeria g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      LEFT JOIN bitacora c ON g.clase_id = c.id
      ORDER BY g.id DESC;
    `);

    console.log("✅ Consulta completada. Filas:", result?.rows?.length || 0);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows || []),
    };
  } catch (err) {
    console.error("❌ Error en getGaleria.js:", err.message);
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
