import { Client } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { nombre, password } = JSON.parse(event.body || "{}");

  if (!nombre || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios." }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Buscar usuario por nombre
    const result = await client.query(
      "SELECT * FROM usuarios WHERE nombre = $1",
      [nombre]
    );

    const user = result.rows[0];
    if (!user) {
      await client.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Usuario no encontrado." }),
      };
    }

    // Validar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await client.end();
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Contraseña incorrecta." }),
      };
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await client.end();

    // Enviar respuesta con token y datos
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Inicio de sesión exitoso",
        usuario: {
          id_usuario: user.id_usuario,
          nombre: user.nombre,
          rol: user.rol,
        },
        token,
      }),
    };
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
