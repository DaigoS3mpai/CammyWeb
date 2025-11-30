import { Client } from "pg";

export const handler = async () => {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      SELECT 
        p.*,
        pr.titulo AS proyecto_titulo
      FROM planificacion p
      LEFT JOIN proyectos pr ON p.proyecto_id = pr.id
      ORDER BY p.id DESC;
    `;

    const result = await client.query(query);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    client.end();
  }
};
