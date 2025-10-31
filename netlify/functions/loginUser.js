// netlify/functions/loginUser.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { nombre, password } = JSON.parse(event.body || "{}");

  if (!nombre || !password) {
    return { statusCode: 400, body: "Faltan campos obligatorios" };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      "SELECT id_usuario, nombre, password, rol FROM usuarios WHERE nombre = $1",
      [nombre]
    );

    await client.end();

    if (result.rows.length === 0) {
      return { statusCode: 404, body: "Usuario no encontrado" };
    }

    const usuario = result.rows[0];

    if (usuario.password !== password) {
      return { statusCode: 401, body: "Contraseña incorrecta" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Login exitoso",
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      }),
    };
  } catch (err) {
    console.error("Error en login:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
