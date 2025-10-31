import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Save,
  FileText,
  Calendar,
  FlaskConical,
  Image,
  Info,
  Link2,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const DetailModal = ({ item, type, onClose, onSave }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [proyectos, setProyectos] = useState([]); // 🔹 Lista de proyectos para el selector

  // 🔹 Cargar proyectos disponibles
  useEffect(() => {
    if (isEditing && type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then((res) => res.json())
        .then((data) => setProyectos(data))
        .catch((err) => console.error("Error al cargar proyectos:", err));
    }
  }, [isEditing, type]);

  // 🔹 Sincronizar al abrir otro item
  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  // 🔹 Manejar cambios de campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Guardar cambios (actualizar en Neon)
  const handleSave = async () => {
    try {
      const res = await fetch("/.netlify/functions/updateClase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editedItem.id,
          titulo: editedItem.titulo,
          descripcion: editedItem.descripcion,
          fecha: editedItem.fecha,
          proyecto_id: editedItem.proyecto_id || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Clase actualizada correctamente");
        onSave && onSave(data.clase, type);
        setIsEditing(false);
      } else {
        alert("❌ Error: " + (data.error || "No se pudo guardar los cambios"));
      }
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("Error al conectar con el servidor.");
    }
  };

  if (!item) return null;

  const titulo = editedItem.titulo || item.titulo || "Sin título";
  const descripcion = editedItem.descripcion || item.descripcion || "Sin descripción";
  const fecha = editedItem.fecha
    ? new Date(editedItem.fecha).toLocaleDateString()
    : item.fecha
    ? new Date(item.fecha).toLocaleDateString()
    : "Sin fecha";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* Título */}
          <div className="flex items-center mb-6">
            {type === "bitacora" && <FileText className="w-8 h-8 text-blue-600 mr-3" />}
            {type === "proyectos" && <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />}
            {type === "galeria" && <Image className="w-8 h-8 text-pink-600 mr-3" />}
            {isEditing ? (
              <input
                type="text"
                name="titulo"
                value={titulo}
                onChange={handleInputChange}
                className="text-3xl font-bold text-gray-900 w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900">{titulo}</h2>
            )}
          </div>

          {/* Imagen (galería) */}
          {type === "galeria" && item.imagen_url && (
            <div className="mb-6">
              <img
                src={item.imagen_url}
                alt={titulo}
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Descripción */}
          <div className="mb-6 text-gray-700 space-y-4">
            <div>
              <p className="font-semibold flex items-center text-lg mb-2">
                <Info className="w-5 h-5 mr-2 text-gray-500" /> Descripción:
              </p>
              {isEditing ? (
                <textarea
                  name="descripcion"
                  value={descripcion}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                />
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap">{descripcion}</p>
              )}
            </div>

            {/* Fecha */}
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-semibold">Fecha:</span> {fecha}
            </div>

            {/* Vincular proyecto */}
            {type === "bitacora" && (
              <div className="mt-4">
                <p className="font-semibold flex items-center text-lg mb-2">
                  <Link2 className="w-5 h-5 mr-2 text-purple-500" /> Proyecto vinculado:
                </p>
                {isEditing ? (
                  <select
                    name="proyecto_id"
                    value={editedItem.proyecto_id || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Sin proyecto</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titulo}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700 text-base">
                    {item.proyecto_titulo || "Sin proyecto asignado"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botones admin */}
          {isAdmin() && (
            <div className="flex justify-end mt-6 space-x-4">
              {isEditing ? (
                <motion.button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-5 h-5 mr-2" /> Guardar
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-5 h-5 mr-2" /> Editar
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailModal;
