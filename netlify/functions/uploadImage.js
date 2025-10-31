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
    const data = JSON.parse(event.body);
    const { imageBase64 } = data;

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta la imagen." }),
      };
    }

    const uploadRes = await cloudinary.v2.uploader.upload(imageBase64, {
      folder: "camyweby/proyectos",
      transformation: [{ width: 1280, crop: "limit" }],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "✅ Imagen subida correctamente",
        url: uploadRes.secure_url,
      }),
    };
  } catch (err) {
    console.error("Error al subir imagen:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
