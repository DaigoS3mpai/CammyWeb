import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Save,
  FileText,
  Calendar,
  FlaskConical,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const DetailModal = ({ item, type, onClose, onSave }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [imagenes, setImagenes] = useState([]);
  const [loadingImgs, setLoadingImgs] = useState(false);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  // 🔹 Cargar imágenes del proyecto
  useEffect(() => {
    const fetchImgs = async () => {
      if (type === "proyectos" && item?.id) {
        try {
          setLoadingImgs(true);
          const res = await fetch(`/.netlify/functions/getImagenesPorProyecto?id=${item.id}`);
          const data = await res.json();
          if (res.ok && data.imagenes) {
            setImagenes(data.imagenes);
          } else {
            setImagenes([]);
          }
        } catch (err) {
          console.error("Error al cargar imágenes del proyecto:", err);
        } finally {
          setLoadingImgs(false);
        }
      }
    };
    fetchImgs();
  }, [type, item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Guardar cambios según tipo
  const handleSave = async () => {
    try {
      const endpoint =
        type === "proyectos"
          ? "/.netlify/functions/updateProyecto"
          : "/.netlify/functions/updateClase";

      const body =
        type === "proyectos"
          ? {
              id: editedItem.id,
              titulo: editedItem.titulo,
              descripcion: editedItem.descripcion,
              fecha_inicio: editedItem.fecha_inicio,
              imagen_portada: editedItem.imagen_portada || null,
            }
          : {
              id: editedItem.id,
              titulo: editedItem.titulo,
              descripcion: editedItem.descripcion,
              fecha: editedItem.fecha,
            };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Datos actualizados correctamente");
        onSave && onSave(data.proyecto || data.clase, type);
        setIsEditing(false);
      } else {
        alert("❌ Error al actualizar: " + (data.error || "Desconocido"));
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
    editedItem.fecha ||
    editedItem.fecha_inicio ||
    item.fecha ||
    new Date().toISOString().split("T")[0];

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
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* Cabecera */}
          <div className="flex items-center mb-6">
            {type === "bitacora" && (
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
            )}
            {type === "proyectos" && (
              <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />
            )}
            {type === "galeria" && (
              <ImageIcon className="w-8 h-8 text-pink-600 mr-3" />
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

          {/* Imagen principal si es proyecto */}
          {type === "proyectos" && (
            <div className="mb-6">
              <p className="font-semibold flex items-center text-lg mb-2">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-500" />
                Imagen principal:
              </p>

              {isEditing ? (
                <>
                  <input
                    type="url"
                    name="imagen_portada"
                    value={editedItem.imagen_portada || ""}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-3"
                  />
                  {editedItem.imagen_portada && (
                    <img
                      src={editedItem.imagen_portada}
                      alt="Vista previa"
                      className="w-full max-h-80 object-contain rounded-xl shadow-md"
                    />
                  )}
                </>
              ) : (
                editedItem.imagen_portada && (
                  <img
                    src={editedItem.imagen_portada}
                    alt="Portada del proyecto"
                    className="w-full max-h-96 object-contain rounded-xl shadow-md"
                  />
                )
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="mb-4 text-gray-700">
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
          <div className="flex items-center text-gray-600 mb-6">
            <Calendar className="w-5 h-5 mr-2" />
            <span className="font-semibold">Fecha:</span>{" "}
            {new Date(fecha).toLocaleDateString("es-CL")}
          </div>

          {/* Imágenes asociadas */}
          {type === "proyectos" && (
            <div className="mb-6">
              <p className="font-semibold flex items-center text-lg mb-4">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-500" />
                Imágenes del proyecto:
              </p>

              {loadingImgs ? (
                <p className="text-gray-500 text-sm">Cargando imágenes...</p>
              ) : imagenes.length === 0 ? (
                <p className="text-gray-500 text-sm">Sin imágenes asociadas.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagenes.map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.url}
                        alt={img.descripcion || "Imagen de proyecto"}
                        className="rounded-xl shadow-md hover:scale-105 transition-transform object-cover w-full h-48"
                      />
                      {img.descripcion && (
                        <p className="text-sm text-gray-600 mt-1 text-center">
                          {img.descripcion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botones admin */}
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
