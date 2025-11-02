import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🚀 Conectando a la base de datos...");

    await client.connect();

    console.log("✅ Conexión establecida. Ejecutando consulta...");

    const result = await client.query(`
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
    `);

    console.log("🧠 Filas obtenidas:", result?.rows?.length);

    await client.end();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows || []),
    };
  } catch (err) {
    console.error("❌ ERROR DETECTADO EN getGaleria.js:");
    console.error("Mensaje:", err.message);
    console.error("Stack:", err.stack);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: err.message,
        detail: err.stack,
      }),
    };
  } finally {
    try {
      await client.end();
    } catch {}
  }
};
