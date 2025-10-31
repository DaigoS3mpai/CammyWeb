// netlify/functions/registerUser.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { nombre, password, confirmar } = JSON.parse(event.body || "{}");

  if (!nombre || !password || !confirmar) {
    return { statusCode: 400, body: "Faltan campos obligatorios" };
  }

  if (password !== confirmar) {
    return { statusCode: 400, body: "Las contraseñas no coinciden" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      `
      INSERT INTO usuarios (nombre, password, rol)
      VALUES ($1, $2, 'usuario')
      RETURNING id_usuario, nombre, rol, fecha_registro;
      `,
      [nombre, password]
    );

    await client.end();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "✅ Usuario registrado correctamente",
        usuario: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
