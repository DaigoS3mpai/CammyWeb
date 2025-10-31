import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        g.id,
        g.imagen_url,
        g.descripcion,
        g.proyecto_id,
        p.titulo AS proyecto_titulo
      FROM galeria g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      ORDER BY g.id DESC;
    `);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows || []), // 🧩 aseguramos siempre array
    };
  } catch (err) {
    console.error("❌ Error al obtener galería:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
