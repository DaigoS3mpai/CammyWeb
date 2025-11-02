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

  // 🔹 Cargar proyectos desde la base de datos
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

  // 🔹 Enviar clase al backend
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

      if (res.ok && data.clase && data.clase.id) {
        alert("✅ Clase creada correctamente");
        navigate(`/class/${data.clase.id}/bitacora`);
      } else {
        alert(`❌ Error: ${data.error || "No se pudo crear la clase correctamente"}`);
      }
    } catch (err) {
      console.error("Error al crear clase:", err);
      alert("❌ Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex-1 p-10 overflow-y-auto min-h-screen bg-cover bg-center bg-fixed text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        backgroundImage: "url('/bc.png')",
      }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-center mb-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Crear Nueva Clase
      </motion.h1>

      <motion.div
        className="bg-black/40 backdrop-blur-sm border border-white/30 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🔹 Título */}
          <div>
            <label htmlFor="titulo" className="block text-white text-lg font-semibold mb-2">
              Título de la Clase *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Clase sobre circuitos eléctricos"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/40 bg-transparent text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
              />
            </div>
          </div>

          {/* 🔹 Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-white text-lg font-semibold mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción de lo que se hizo en clase..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-transparent text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg resize-y"
            />
          </div>

          {/* 🔹 Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-white text-lg font-semibold mb-2">
              Fecha de realización *
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/40 bg-transparent text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
            />
          </div>

          {/* 🔹 Vincular a proyecto */}
          <div>
            <label htmlFor="proyecto" className="block text-white text-lg font-semibold mb-2">
              Vincular a un proyecto (opcional)
            </label>
            <div className="relative">
              <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <select
                id="proyecto"
                value={proyectoSeleccionado}
                onChange={(e) => setProyectoSeleccionado(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/40 bg-transparent text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg"
              >
                <option value="">Sin proyecto</option>
                {proyectos.length > 0 ? (
                  proyectos.map((p) => (
                    <option key={p.id} value={p.id} className="text-gray-800">
                      {p.titulo}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay proyectos disponibles</option>
                )}
              </select>
            </div>
          </div>

          {/* 🔹 Botón enviar */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xl text-white shadow-lg flex items-center justify-center border border-white/40 ${
              loading
                ? "bg-white/20 cursor-not-allowed"
                : "bg-black/40 hover:bg-black/60 transition-all"
            }`}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle className="w-6 h-6 mr-3 text-pink-300" />
            {loading ? "Guardando..." : "Crear Clase"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewClassPage;
