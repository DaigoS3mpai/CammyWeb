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
        g.descripcion,
        g.proyecto_id,
        g.clase_id,
        g.tipo,
        p.titulo AS proyecto_titulo,
        b.titulo AS clase_titulo
      FROM galeria g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      LEFT JOIN bitacora b ON g.clase_id = b.id
      ORDER BY g.id DESC;
    `);

    console.log("✅ Consulta completada. Filas:", result?.rows?.length || 0);

    await client.end();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows || []),
    };
  } catch (err) {
    console.error("❌ Error en getGaleria.js:");
    console.error("Mensaje:", err.message);
    console.error("Stack:", err.stack);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: err.message,
      }),
    };
  } finally {
    try {
      await client.end();
    } catch {}
  }
};
