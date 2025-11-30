import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  try {
    const { fileBase64, filename } = JSON.parse(event.body || "{}");

    if (!fileBase64 || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan datos" }),
      };
    }

    const uploadRes = await cloudinary.v2.uploader.upload(fileBase64, {
      folder: "camyweb/planificacion",
      resource_type: "raw",
      public_id: filename,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Archivo subido correctamente",
        url: uploadRes.secure_url,
      }),
    };
  } catch (err) {
    console.error("Error al subir archivo:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
