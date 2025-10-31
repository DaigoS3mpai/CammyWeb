import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FlaskConical, Image as ImageIcon, Loader2 } from "lucide-react";

const DetailModal = ({ item, type, onClose }) => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar imágenes del proyecto cuando el modal se abre
  useEffect(() => {
    if (type === "proyectos" && item?.id) {
      const fetchImagenes = async () => {
        try {
          const res = await fetch(`/.netlify/functions/getGaleria`);
          const data = await res.json();
          const relacionadas = data.filter((img) => img.proyecto_id === item.id);
          setImagenes(relacionadas);
        } catch (err) {
          console.error("Error al cargar imágenes del proyecto:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchImagenes();
    } else {
      setLoading(false);
    }
  }, [item, type]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="p-8 overflow-y-auto max-h-[90vh]">
            {/* Cabecera */}
            <div className="flex items-center mb-6">
              {type === "proyectos" ? (
                <FlaskConical className="w-7 h-7 text-purple-600 mr-3" />
              ) : (
                <ImageIcon className="w-7 h-7 text-blue-600 mr-3" />
              )}
              <h2 className="text-3xl font-bold text-gray-900">
                {item.titulo || "Sin título"}
              </h2>
            </div>

            {/* Descripción */}
            <p className="text-gray-700 text-lg mb-4">
              {item.descripcion || "Sin descripción disponible."}
            </p>

            {/* Fecha */}
            {item.fecha_inicio && (
              <div className="flex items-center text-gray-500 mb-6">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{new Date(item.fecha_inicio).toLocaleDateString("es-CL")}</span>
              </div>
            )}

            {/* Imagen de portada */}
            {item.imagen_portada && (
              <div className="mb-8">
                <img
                  src={item.imagen_portada}
                  alt={item.titulo}
                  className="w-full max-h-96 object-cover rounded-2xl shadow-md"
                />
              </div>
            )}

            {/* Galería interna */}
            {type === "proyectos" && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-pink-500" />
                  Galería del Proyecto
                </h3>

                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin w-8 h-8 text-pink-500" />
                  </div>
                ) : imagenes.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No hay imágenes asociadas a este proyecto.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {imagenes.map((img) => (
                      <motion.div
                        key={img.id}
                        className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.03 }}
                      >
                        <img
                          src={img.imagen_url}
                          alt={img.descripcion || "Imagen"}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-2 text-sm text-gray-600 text-center">
                          {img.descripcion || "Sin descripción"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailModal;
