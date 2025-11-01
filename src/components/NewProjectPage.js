import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  FlaskConical,
  Calendar,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewProjectPage = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [imagenPortada, setImagenPortada] = useState("");
  const [imagenesExtras, setImagenesExtras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

// 🔹 Subir imagen a Cloudinary (compatible con CRA y Netlify)
const uploadToCloudinary = async (file) => {
  const cloudName =
    process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET;

  console.log("🌐 Cloudinary vars:", { cloudName, uploadPreset });

  if (!cloudName || !uploadPreset) {
    console.error("⚠️ Faltan variables de entorno de Cloudinary.");
    alert("No se pudo conectar con Cloudinary. Verifica las variables en Netlify.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Error al subir imagen");
    console.log("✅ Imagen subida a Cloudinary:", data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error("❌ Error subiendo imagen:", err);
    alert("No se pudo subir la imagen. Intenta nuevamente.");
    return null;
  }
};



  // 🔹 Subir imágenes adicionales
  const handleExtraImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        if (url) urls.push(url);
      }
      setImagenesExtras((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Error al subir imágenes adicionales:", err);
      alert("❌ No se pudieron subir algunas imágenes.");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Crear proyecto
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !fechaInicio.trim()) {
      alert("Por favor completa los campos obligatorios (Título y Fecha).");
      return;
    }

    setLoading(true);

    try {
      // 🟢 Crear proyecto
      const res = await fetch("/.netlify/functions/addProyecto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          fecha_inicio: fechaInicio,
          imagen_portada: imagenPortada || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error creando el proyecto.");
      }

      const proyectoId = data.proyecto.id;

      // 🖼️ Guardar portada en galería
      if (imagenPortada) {
        await fetch("/.netlify/functions/addImagen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagen_url: imagenPortada,
            descripcion: `Portada del proyecto ${titulo}`,
            proyecto_id: proyectoId,
          }),
        });
      }

      // 🖼️ Guardar imágenes adicionales
      for (const url of imagenesExtras) {
        await fetch("/.netlify/functions/addImagen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagen_url: url,
            descripcion: `Imagen adicional del proyecto ${titulo}`,
            proyecto_id: proyectoId,
          }),
        });
      }

      alert("✅ Proyecto creado correctamente.");

      // 🔁 Actualizar categorías relacionadas
      localStorage.setItem("reloadProyectos", "true");
      localStorage.setItem("reloadGaleria", "true");

      // 🔄 Limpiar formulario
      setTitulo("");
      setDescripcion("");
      setFechaInicio("");
      setImagenPortada("");
      setImagenesExtras([]);

      // 🚀 Redirigir
      navigate("/category/proyectos");
    } catch (err) {
      console.error("❌ Error al crear proyecto:", err);
      alert("Ocurrió un error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex-1 p-10 bg-gradient-to-br from-green-50 to-emerald-100 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-700 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Crear Nuevo Proyecto
      </motion.h1>

      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Nombre del Proyecto *
            </label>
            <div className="relative">
              <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Proyecto de Robótica Educativa"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente el proyecto..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg resize-y"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Fecha de Inicio *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg"
                required
              />
            </div>
          </div>

          {/* Imagen principal */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Imagen principal (portada)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  setUploading(true);
                  const url = await uploadToCloudinary(file);
                  if (url) setImagenPortada(url);
                  setUploading(false);
                }
              }}
              className="w-full border border-gray-300 rounded-xl p-2"
            />
            {uploading && (
              <Loader2 className="animate-spin w-6 h-6 mt-2 text-green-500" />
            )}
            {imagenPortada && (
              <img
                src={imagenPortada}
                alt="Portada"
                className="w-full mt-3 rounded-xl shadow-md"
              />
            )}
          </div>

          {/* Imágenes adicionales */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Imágenes adicionales (opcionales)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleExtraImages}
              className="w-full border border-gray-300 rounded-xl p-2"
            />
            {uploading && (
              <Loader2 className="animate-spin w-6 h-6 mt-2 text-green-500" />
            )}
            <div className="grid grid-cols-3 gap-3 mt-3">
              {imagenesExtras.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Extra ${i + 1}`}
                    className="rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImagenesExtras((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botón Crear */}
          <motion.button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-70 mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle className="w-6 h-6 mr-3" />
            {loading ? "Creando..." : "Crear Proyecto"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewProjectPage;
