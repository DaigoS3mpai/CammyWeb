import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewClassPage = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Enviar clase a Neon
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !fecha.trim()) {
      alert("Por favor completa los campos obligatorios (Título y Fecha).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/addClase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          fecha,
          proyecto_id: 1, // 🔹 Vincula siempre a tu proyecto principal (puedes hacerlo dinámico luego)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Clase creada correctamente");

        // Redirigir a la vista de bitácora de esa clase
        navigate(`/class/${data.clase.id}/bitacora`);
      } else {
        alert("❌ Error: " + (data.error || "No se pudo crear la clase."));
      }
    } catch (err) {
      console.error("Error al crear clase:", err);
      alert("Ocurrió un error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex-1 p-10 bg-gradient-to-br from-blue-50 to-purple-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Crear Nueva Clase
      </motion.h1>

      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label
              htmlFor="titulo"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Título de la Clase *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Clase 3 - Evaluación de materiales"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="descripcion"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente los contenidos o actividades de la clase..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg resize-y"
            ></textarea>
          </div>

          {/* Fecha */}
          <div>
            <label
              htmlFor="fecha"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Fecha de realización *
            </label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
              required
            />
          </div>

          {/* Botón */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            whileHover={!loading ? { scale: 1.03 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
          >
            {loading ? (
              <span className="animate-pulse">Guardando...</span>
            ) : (
              <>
                <PlusCircle className="w-6 h-6 mr-3" />
                Crear Clase
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewClassPage;
