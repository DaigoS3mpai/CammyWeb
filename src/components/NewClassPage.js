import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, PlusCircle, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewClassPage = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Cargar proyectos existentes (si hay)
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch(`${window.location.origin}/.netlify/functions/getProyectos`);
        if (!res.ok) throw new Error("Error al cargar proyectos");
        const data = await res.json();
        setProyectos(data || []);
      } catch (err) {
        console.warn("⚠️ No hay proyectos disponibles:", err.message);
        setProyectos([]);
      }
    };
    fetchProyectos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !fecha.trim()) {
      alert("Por favor completa el título y la fecha.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${window.location.origin}/.netlify/functions/addClase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          fecha,
          proyecto_id: proyectoSeleccionado || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Clase creada correctamente");
        navigate("/category/bitacora");
      } else {
        alert(`❌ Error: ${data.error || "No se pudo crear la clase"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error de conexión con el servidor.");
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
        className="text-5xl font-extrabold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
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
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-gray-700 text-lg font-semibold mb-2">
              Título de la Clase *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Clase sobre circuitos eléctricos"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-gray-700 text-lg font-semibold mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción de lo que se hizo en clase..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg resize-y"
            />
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-gray-700 text-lg font-semibold mb-2">
              Fecha de realización *
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Vincular proyecto (opcional) */}
          <div>
            <label htmlFor="proyecto" className="block text-gray-700 text-lg font-semibold mb-2">
              Vincular a un proyecto (opcional)
            </label>
            <div className="relative">
              <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                id="proyecto"
                value={proyectoSeleccionado}
                onChange={(e) => setProyectoSeleccionado(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              >
                <option value="">Sin proyecto</option>
                {proyectos.length > 0 ? (
                  proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titulo}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay proyectos disponibles</option>
                )}
              </select>
            </div>
          </div>

          {/* Botón */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xl text-white shadow-lg flex items-center justify-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl transform hover:scale-105 transition-all"
            }`}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle className="w-6 h-6 mr-3" />
            {loading ? "Guardando..." : "Crear Clase"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewClassPage;
