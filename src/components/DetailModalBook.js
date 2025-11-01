import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  FlaskConical,
  Image as ImageIcon,
  FileText,
  Layers,
  BookOpen,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const DetailModalBook = ({ item, type, onClose }) => {
  const { isAdmin } = useAuth();
  const [proyectoTitulo, setProyectoTitulo] = useState(null);

  useEffect(() => {
    if (type === "bitacora" && item?.proyecto_id && !item.proyecto_titulo) {
      fetch("/.netlify/functions/getProyectos")
        .then((res) => res.json())
        .then((data) => {
          const proyecto = data.find((p) => p.id === item.proyecto_id);
          setProyectoTitulo(proyecto ? proyecto.titulo : null);
        })
        .catch(() => setProyectoTitulo(null));
    }
  }, [item, type]);

  const fecha =
    item.fecha_inicio || item.fecha
      ? new Date(item.fecha_inicio || item.fecha).toLocaleDateString("es-CL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  // 🔹 Variantes de animación 3D de apertura tipo libro
  const bookVariants = {
    hidden: { rotateY: 90, opacity: 0, scale: 0.9 },
    visible: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 18,
      },
    },
    exit: { rotateY: -90, opacity: 0, scale: 0.9 },
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(false)}
        >
          <motion.div
            className="relative perspective-1000"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="relative bg-gradient-to-br from-[#f9f8f5] to-[#f3f2ee] shadow-2xl rounded-2xl w-full max-w-6xl flex overflow-hidden border border-[#d8d5cc]"
              variants={bookVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Lomo del libro */}
              <div className="absolute top-0 left-1/2 w-[5px] h-full bg-gradient-to-b from-[#c9c7c0] to-[#b6b4ac] shadow-inner z-10" />

              {/* Botón cerrar */}
              <button
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-20"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Página izquierda */}
              <motion.div
                className="w-1/2 p-8 bg-[#fbfaf8] flex flex-col justify-between border-r border-[#dcd8ce]"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "right center", backfaceVisibility: "hidden" }}
              >
                <div>
                  <div className="flex items-center mb-6">
                    {type === "proyectos" ? (
                      <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-800">
                      {item.titulo}
                    </h2>
                  </div>

                  {fecha && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Fecha del proyecto
                        </h3>
                      </div>
                      <p className="text-gray-600">{fecha}</p>
                    </div>
                  )}

                  {type === "bitacora" && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Layers className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Proyecto vinculado
                        </h3>
                      </div>
                      {item.proyecto_id ? (
                        <button
                          onClick={() => {
                            localStorage.setItem("openProyectoId", item.proyecto_id);
                            onClose(true);
                          }}
                          className="text-purple-600 hover:underline font-semibold"
                        >
                          {item.proyecto_titulo ||
                            proyectoTitulo ||
                            `Proyecto #${item.proyecto_id}`}
                        </button>
                      ) : (
                        <p className="text-gray-500 italic">Sin proyecto vinculado.</p>
                      )}
                    </div>
                  )}

                  {type === "proyectos" && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Clases vinculadas
                        </h3>
                      </div>
                      {item.clase_count > 0 ? (
                        <p className="text-gray-600">
                          {item.clase_count} clases registradas.
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Sin clases vinculadas aún.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Imagen principal */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
                    <ImageIcon className="w-5 h-5 text-purple-500 mr-2" /> Imagen
                    principal
                  </h3>
                  {item.imagen_portada ? (
                    <img
                      src={item.imagen_portada}
                      alt={item.titulo}
                      className="w-full rounded-xl shadow-md border border-gray-200 object-cover max-h-[300px]"
                    />
                  ) : (
                    <p className="text-gray-500 italic">Sin imagen de portada.</p>
                  )}
                </div>
              </motion.div>

              {/* Página derecha */}
              <motion.div
                className="w-1/2 p-8 bg-[#fefdfb] flex flex-col justify-between"
                initial={{ rotateY: -180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
              >
                <div>
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Descripción
                    </h3>
                  </div>
                  <div className="bg-white border border-[#e5e2d9] shadow-inner rounded-xl p-4 text-gray-700 leading-relaxed min-h-[300px]">
                    {item.descripcion || "Sin descripción disponible."}
                  </div>
                </div>

                {/* Galería (proyectos) */}
                {type === "proyectos" && item.imagenes?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <ImageIcon className="w-5 h-5 text-pink-500 mr-2" /> Galería
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {item.imagenes.slice(0, 4).map((img) => (
                        <motion.img
                          key={img.id}
                          src={img.imagen_url}
                          alt={img.descripcion || "Imagen"}
                          className="rounded-lg shadow-sm border border-gray-200 object-cover h-32 w-full"
                          whileHover={{ scale: 1.05 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModalBook;
