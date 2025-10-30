import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, BookOpen, Calendar, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewClassPage = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 Cargar proyectos disponibles desde Neon
  useEffect(() => {
    fetch("/.netlify/functions/getProyectos")
      .then((res) => res.json())
      .then((data) => setProyectos(data))
      .catch((err) => console.error("Error al cargar proyectos:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim() || !fecha || !proyectoId) {
      alert("Por favor completa todos los campos.");
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
          proyecto_id: parseInt(proyectoId),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Clase creada exitosamente");
        navigate("/bitacora"); // Redirige a la lista de clases
      } else {
        alert("❌ Error al crear la clase: " + (data.error || "Desconocido"));
      }
    } catch (error) {
      console.error("Error:", error);
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
        className="text-5xl font-extrabold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-700"
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
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la clase */}
          <div>
            <label
              htmlFor="titulo"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Nombre / Título de la Clase
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Introducción a Proyectos Tecnológicos"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
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
              placeholder="Describe brevemente lo que se realizó en esta clase..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg resize-y"
              required
            ></textarea>
          </div>

          {/* Fecha */}
          <div>
            <label
              htmlFor="fecha"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Fecha de la Clase
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
                required
              />
            </div>
          </div>

          {/* Proyecto */}
          <div>
            <label
              htmlFor="proyecto"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Proyecto Asociado
            </label>
            <div className="relative">
              <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                id="proyecto"
                value={proyectoId}
                onChange={(e) => setProyectoId(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
                required
              >
                <option value="">Selecciona un proyecto</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón enviar */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle className="w-6 h-6 mr-3" />
            {loading ? "Creando..." : "Crear Clase"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewClassPage;
