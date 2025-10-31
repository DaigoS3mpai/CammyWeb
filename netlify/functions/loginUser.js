// netlify/functions/loginUser.js
import { Client } from "pg";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { nombre, password } = JSON.parse(event.body || "{}");

  if (!nombre || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Buscar el usuario
    const result = await client.query(
      `SELECT id_usuario, nombre, password, rol 
       FROM usuarios 
       WHERE nombre = $1`,
      [nombre]
    );

    if (result.rows.length === 0) {
      await client.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Usuario no encontrado" }),
      };
    }

    const usuario = result.rows[0];

    // Comparar contraseñas (sin bcrypt)
    if (usuario.password !== password) {
      await client.end();
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Contraseña incorrecta" }),
      };
    }

    await client.end();

    // Login exitoso
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Inicio de sesión exitoso",
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
