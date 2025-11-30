import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, PlusCircle } from "lucide-react";
import PlanificacionModal from "./PlanificacionModal";
import { useAuth } from "./AuthContext";

const CategoryPlanificacion = () => {
  const [lista, setLista] = useState([]);
  const [selected, setSelected] = useState(null);
  const { isAdmin } = useAuth();

  const cargar = () => {
    fetch("/.netlify/functions/getPlanificacion")
      .then((r) => r.json())
      .then((data) => setLista(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-[#4e3c2b]">Planificación</h1>

        {isAdmin() && (
          <button
            onClick={() => setSelected({ isNew: true })}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            <PlusCircle className="mr-2" /> Nueva planificación
          </button>
        )}
      </div>

      {lista.length === 0 ? (
        <p className="text-gray-600 italic">No hay planificaciones aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lista.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.03 }}
              className="bg-[#faf6f1] border border-[#d4c5a9] rounded-xl shadow cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <img
                src={p.imagen_portada}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-[#4e3c2b]">
                  {p.titulo}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(p.fecha).toLocaleDateString("es-CL")}
                </p>

                <div className="mt-2 flex items-center text-[#7a4e27] font-medium">
                  <FileText className="w-4 h-4 mr-2" />
                  Archivos adjuntos
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <PlanificacionModal
          item={selected}
          onClose={() => {
            setSelected(null);
            cargar();
          }}
        />
      )}
    </div>
  );
};

export default CategoryPlanificacion;