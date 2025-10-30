import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, FlaskConical, Calendar, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewProjectPage = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !fechaInicio.trim()) {
      alert("Por favor completa los campos obligatorios (Título y Fecha).");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Crear proyecto en la base de datos
      const res = await fetch("/.netlify/functions/addProyecto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          fecha_inicio: fechaInicio,
          imagen_portada: imagenUrl || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Proyecto creado correctamente");

        // 🔹 Si hay imagen, registrarla en la galería automáticamente
        if (imagenUrl) {
          await fetch("/.netlify/functions/addImagen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imagen_url: imagenUrl,
              descripcion: `Imagen principal del proyecto ${titulo}`,
              proyecto_id: data.proyecto.id,
            }),
          });
        }

        // 🔹 Forzar recarga de lista en la vista principal
        localStorage.setItem("reloadProyectos", "true");
        localStorage.setItem("reloadGaleria", "true");

        navigate("/category/proyectos");
      } else {
        alert("❌ Error: " + (data.error || "No se pudo crear el proyecto."));
      }
    } catch (err) {
      console.error("Error al crear proyecto:", err);
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
          {/* 🔹 Título */}
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

          {/* 🔹 Descripción */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente de qué trata este proyecto..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg resize-y"
            />
          </div>

          {/* 🔹 Fecha */}
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

          {/* 🔹 Imagen principal */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Imagen principal (opcional)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg"
              />
            </div>
          </div>

          {/* 🔹 Botón */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
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
