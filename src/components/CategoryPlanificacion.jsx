import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Calendar,
  FileText,
  Paperclip,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import PlanificacionModal from "./PlanificacionModal";

const CategoryPlanificacion = () => {
  const { isAdmin } = useAuth();

  const [planificaciones, setPlanificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [creating, setCreating] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");

  // 🔹 Cargar planificaciones
  const fetchPlanificaciones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/getPlanificacion");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlanificaciones(data);
        // si no hay seleccionada, tomar la primera
        if (!selected && data.length > 0) {
          setSelected(data[0]);
        }
      } else {
        setPlanificaciones([]);
      }
    } catch (err) {
      console.error("Error al cargar planificaciones:", err);
      setPlanificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanificaciones();
  }, []);

  // 🔹 Crear nueva planificación rápida
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitulo.trim()) return;

    try {
      const res = await fetch("/.netlify/functions/addPlanificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: newTitulo,
          descripcion: newDescripcion || null,
        }),
      });

      if (!res.ok) throw new Error("Error al crear planificación.");

      setNewTitulo("");
      setNewDescripcion("");
      setCreating(false);
      await fetchPlanificaciones();
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo crear la planificación.");
    }
  };

  const bgStyle = {
    backgroundImage: "url('/bc.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* capa de color encima del fondo */}
      <div className="min-h-screen bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Título + botón */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
              Planificación
            </h1>

            {isAdmin() && (
              <button
                onClick={() => setCreating((v) => !v)}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                {creating ? "Cancelar" : "Nueva planificación"}
              </button>
            )}
          </div>

          {/* Formulario para crear nueva planificación */}
          {creating && isAdmin() && (
            <motion.form
              onSubmit={handleCreate}
              className="mb-6 bg-white/90 rounded-2xl p-4 shadow-lg border border-white/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={newTitulo}
                  onChange={(e) => setNewTitulo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ej: Planificación de la Unidad 1"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción inicial (opcional)
                </label>
                <textarea
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-20"
                  placeholder="Breve descripción de la planificación..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  Guardar planificación
                </button>
              </div>
            </motion.form>
          )}

          {/* Contenido principal: lista + detalle */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: tarjetas + imagen */}
            <div className="lg:col-span-1 flex flex-col space-y-4">
              {/* Lista de planificaciones */}
              <div className="space-y-4">
                {loading ? (
                  <p className="text-white/90">Cargando planificaciones...</p>
                ) : planificaciones.length === 0 ? (
                  <p className="text-white/90 italic">
                    No hay planificaciones registradas.
                  </p>
                ) : (
                  planificaciones.map((plan) => {
                    const fecha = plan.fecha
                      ? new Date(plan.fecha).toLocaleDateString("es-CL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : null;

                    return (
                      <motion.button
                        key={plan.id}
                        onClick={() => setSelected(plan)}
                        className={`w-full text-left rounded-2xl p-4 shadow-lg border transition transform hover:-translate-y-1 ${
                          selected?.id === plan.id
                            ? "bg-white text-[#4b3826] border-amber-500"
                            : "bg-white/90 text-[#4b3826] border-white/60 hover:border-amber-400"
                        }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <h3 className="font-bold text-lg mb-1">
                          {plan.titulo || "Sin título"}
                        </h3>
                        {fecha && (
                          <div className="flex items-center text-xs text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {fecha}
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <Paperclip className="w-4 h-4 mr-1" />
                          {plan.total_archivos
                            ? `${plan.total_archivos} archivos adjuntos`
                            : "Archivos adjuntos"}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Imagen decorativa en el espacio que marcaste */}
              <div className="hidden lg:flex justify-center mt-4">
              <img
                src="/chibi-profesora.png"
                alt="Ilustración de planificación"
                className="w-[180px] rounded-2xl shadow-xl object-contain opacity-95"
              />
            </div>
            </div>

            {/* Columna derecha: detalle en la misma página */}
            <div className="lg:col-span-2">
              {selected ? (
                <PlanificacionModal
                  item={selected}
                  onUpdated={fetchPlanificaciones}
                />
              ) : (
                <div className="bg-white/90 rounded-2xl p-8 shadow-lg border border-white/60 text-[#4b3826]">
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 mr-2 text-amber-700" />
                    <h2 className="text-xl font-bold">
                      Selecciona una planificación
                    </h2>
                  </div>
                  <p className="text-sm text-gray-700">
                    Elige una planificación de la lista de la izquierda para
                    ver su contenido, descripción y archivos adjuntos en esta
                    misma pantalla.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPlanificacion;
