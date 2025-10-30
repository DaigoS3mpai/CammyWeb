import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Save,
  FileText,
  Calendar,
  Tag,
  FlaskConical,
  Image,
  Info,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const DetailModal = ({ item, type, onClose, onSave }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Guardar cambios (clase o proyecto)
  const handleSave = async () => {
    try {
      let endpoint = "";
      let bodyData = {};

      if (type === "bitacora") {
        endpoint = "/.netlify/functions/updateClase";
        bodyData = {
          id: editedItem.id,
          titulo: editedItem.titulo,
          descripcion: editedItem.descripcion,
          fecha: editedItem.fecha,
          proyecto_id: editedItem.proyecto_id || null,
        };
      } else if (type === "proyectos") {
        endpoint = "/.netlify/functions/updateProyecto";
        bodyData = {
          id: editedItem.id,
          titulo: editedItem.titulo,
          descripcion: editedItem.descripcion,
          fecha_inicio: editedItem.fecha_inicio,
          imagen_portada: editedItem.imagen_portada || null,
        };
      } else {
        alert("Este tipo de elemento no es editable.");
        return;
      }

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Cambios guardados correctamente");
        setIsEditing(false);
        onSave?.(data[type === "bitacora" ? "clase" : "proyecto"], type);
      } else {
        alert("❌ Error: " + (data.error || "No se pudo guardar"));
      }
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("Error al conectar con el servidor.");
    }
  };

  if (!item) return null;

  const titulo = editedItem.titulo || "Sin título";
  const descripcion = editedItem.descripcion || "Sin descripción";

  const fecha =
    type === "bitacora"
      ? editedItem.fecha || item.fecha
      : editedItem.fecha_inicio || item.fecha_inicio;

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
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* Título */}
          <div className="flex items-center mb-6">
            {type === "bitacora" && (
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
            )}
            {type === "proyectos" && (
              <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />
            )}
            {type === "galeria" && (
              <Image className="w-8 h-8 text-pink-600 mr-3" />
            )}

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

          {/* Imagen principal (para proyectos o galería) */}
          {(type === "proyectos" || type === "galeria") && (
            <div className="mb-6">
              {isEditing ? (
                <>
                  <label className="block text-gray-700 font-semibold mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="text"
                    name={
                      type === "proyectos" ? "imagen_portada" : "imagen_url"
                    }
                    value={
                      type === "proyectos"
                        ? editedItem.imagen_portada || ""
                        : editedItem.imagen_url || ""
                    }
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {(editedItem.imagen_portada || editedItem.imagen_url) && (
                    <img
                      src={
                        editedItem.imagen_portada || editedItem.imagen_url
                      }
                      alt="Vista previa"
                      className="mt-4 w-full rounded-xl shadow-md max-h-96 object-contain"
                    />
                  )}
                </>
              ) : (
                (item.imagen_portada || item.imagen_url) && (
                  <img
                    src={item.imagen_portada || item.imagen_url}
                    alt="Vista"
                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                  />
                )
              )}
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
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {descripcion}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-semibold">Fecha:</span>
              {isEditing ? (
                <input
                  type="date"
                  name={type === "bitacora" ? "fecha" : "fecha_inicio"}
                  value={fecha ? fecha.split("T")[0] : ""}
                  onChange={handleInputChange}
                  className="ml-2 border rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <span className="ml-2">
                  {fecha
                    ? new Date(fecha).toLocaleDateString("es-CL")
                    : "Sin fecha registrada"}
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          {isAdmin() && (
            <div className="flex justify-end mt-6 space-x-4">
              {isEditing ? (
                <motion.button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-5 h-5 mr-2" /> Guardar
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300 flex items-center"
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
