import { Client } from "pg";
import bcrypt from "bcryptjs";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { nombre, password, confirmar } = JSON.parse(event.body || "{}");

  // 🔹 Validación básica
  if (!nombre || !password || !confirmar) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios." }),
    };
  }

  if (password !== confirmar) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Las contraseñas no coinciden." }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // 🔍 Verificar si ya existe el usuario
    const exists = await client.query(
      `SELECT id_usuario FROM usuarios WHERE nombre = $1;`,
      [nombre]
    );
    if (exists.rows.length > 0) {
      await client.end();
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "Ese nombre de usuario ya existe." }),
      };
    }

    // 🔐 Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // 🧩 Insertar nuevo usuario con rol por defecto "usuario"
    const result = await client.query(
      `
      INSERT INTO usuarios (nombre, password, rol, fecha_registro)
      VALUES ($1, $2, 'usuario', NOW())
      RETURNING id_usuario, nombre, rol, fecha_registro;
      `,
      [nombre, hash]
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
    console.error("❌ Error al registrar usuario:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno al registrar el usuario.",
        detalle: err.message,
      }),
    };
  }
};
