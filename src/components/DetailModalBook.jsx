import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Calendar, FlaskConical, Image as ImageIcon,
  FileText, Layers, BookOpen, Pencil, Save,
  ArrowLeftCircle, ArrowRightCircle, Loader2,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const DetailModalBook = ({ item, type, onClose }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [proyectoTitulo, setProyectoTitulo] = useState(null);
  const [linkedClases, setLinkedClases] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [descripcion, setDescripcion] = useState(item?.descripcion || "");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [allProyectos, setAllProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState(item?.proyecto_id || "");
  const [nuevasImagenes, setNuevasImagenes] = useState([]);

  // 🔹 Cargar proyectos
  useEffect(() => {
    if (type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then(res => res.json())
        .then(data => setAllProyectos(data))
        .catch(() => setAllProyectos([]));
    }
  }, [type]);

  // 🔹 Cargar clases de un proyecto
  useEffect(() => {
    if (type === "proyectos" && item?.id) {
      fetch("/.netlify/functions/getClases")
        .then(res => res.json())
        .then(data => {
          const relacionadas = data.filter(c => c.proyecto_id === item.id);
          setLinkedClases(relacionadas);
        })
        .catch(() => setLinkedClases([]));
    }
  }, [item, type]);

  // 📅 Fecha
  const fecha =
    item.fecha_inicio || item.fecha
      ? new Date(item.fecha_inicio || item.fecha).toLocaleDateString("es-CL", {
          year: "numeric", month: "long", day: "numeric",
        })
      : null;

  // 🌀 Flip 3D Cinemático
  const bookVariants = {
    hidden: { rotateY: 90, opacity: 0, scale: 0.96 },
    visible: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] },
    },
    exit: { rotateY: -90, opacity: 0, scale: 0.96, transition: { duration: 1.2 } },
  };

  // 🧭 Navegación
  const handleNavigate = (id, destino) => {
    if (!id) return;
    if (destino === "proyecto") {
      localStorage.setItem("openProyectoId", id);
      localStorage.setItem("reloadProyectos", "true");
      navigate("/category/proyectos");
    } else {
      localStorage.setItem("openClaseId", id);
      localStorage.setItem("reloadBitacora", "true");
      navigate("/category/bitacora");
    }
    onClose(true);
  };

  // ☁️ Cloudinary
  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      alert("⚠️ Faltan variables de Cloudinary.");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  // 💾 Guardar
  const handleSave = async () => {
    if (!titulo.trim()) return alert("El título no puede estar vacío.");
    setSaving(true);
    try {
      const endpoint =
        type === "proyectos"
          ? "/.netlify/functions/updateProyecto"
          : "/.netlify/functions/updateClase";

      const payload =
        type === "bitacora"
          ? { id: item.id, titulo, descripcion, proyecto_id: proyectoId }
          : { id: item.id, titulo, descripcion };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar.");

      if (type === "proyectos" && nuevasImagenes.length > 0) {
        for (const file of nuevasImagenes) {
          const url = await uploadToCloudinary(file);
          if (url) {
            await fetch("/.netlify/functions/addImagen", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imagen_url: url,
                descripcion: `Imagen agregada a ${titulo}`,
                proyecto_id: item.id,
              }),
            });
          }
        }
      }
      alert("✅ Cambios guardados correctamente");
      setEditMode(false);
      onClose(true);
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar cambios.");
    } finally {
      setSaving(false);
    }
  };

  // 🖼️ Paginación de galería (4 por página)
  const imagesPerPage = 4;
  const totalImages = item.imagenes?.length || 0;
  const totalPages = type === "proyectos" ? Math.ceil(totalImages / imagesPerPage) + 1 : 1;

  const currentImages =
    type === "proyectos" && page > 1
      ? item.imagenes.slice((page - 2) * imagesPerPage, (page - 1) * imagesPerPage)
      : [];

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
          <motion.div className="relative perspective-1000" onClick={(e) => e.stopPropagation()}>
            <motion.div
              className="relative bg-gradient-to-br from-[#faf9f7] to-[#f2f1ee] shadow-2xl rounded-2xl w-full max-w-[1150px] min-h-[650px] flex overflow-hidden border border-[#d8d5cc]"
              variants={bookVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformStyle: "preserve-3d", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
            >
              {/* ✏️ Botones */}
              <div className="absolute top-4 right-4 flex space-x-2 z-20">
                {isAdmin() && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-2 shadow-md"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-md"
                    >
                      {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-gray-300 hover:bg-gray-400 rounded-full p-2 shadow-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button onClick={() => onClose(false)} className="bg-gray-100 hover:bg-gray-200 rounded-full p-2">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* 📖 Página izquierda */}
              <motion.div
                className="w-1/2 p-8 bg-[#fbfaf8] flex flex-col justify-between border-r border-[#dcd8ce]"
                style={{ boxShadow: "inset -5px 0 20px rgba(0,0,0,0.08)" }}
              >
                <div>
                  <div className="flex items-center mb-6">
                    {type === "proyectos" ? (
                      <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                    )}
                    {editMode ? (
                      <input
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="text-3xl font-bold text-gray-800 border-b border-gray-400 focus:outline-none bg-transparent w-full"
                      />
                    ) : (
                      <h2 className="text-3xl font-extrabold text-gray-800">{titulo}</h2>
                    )}
                  </div>

                  {fecha && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">Fecha</h3>
                      </div>
                      <p className="text-gray-600">{fecha}</p>
                    </div>
                  )}

                  {type === "proyectos" && (
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-1">
                        <BookOpen className="w-5 h-5 text-blue-600 mr-2" /> Clases vinculadas
                      </h3>
                      {linkedClases.length > 0 ? (
                        <ul className="space-y-2">
                          {linkedClases.map((c) => (
                            <li key={c.id}>
                              <button
                                onClick={() => handleNavigate(c.id, "clase")}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {c.titulo}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">Sin clases vinculadas.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
                    <ImageIcon className="w-5 h-5 text-purple-500 mr-2" /> Imagen principal
                  </h3>
                  {item.imagen_portada ? (
                    <img
                      src={item.imagen_portada}
                      alt={titulo}
                      className="w-full rounded-xl shadow-md border border-gray-200 object-cover max-h-[300px]"
                    />
                  ) : (
                    <p className="text-gray-500 italic">Sin imagen de portada.</p>
                  )}
                </div>
              </motion.div>

              {/* 📄 Página derecha */}
              <motion.div
                key={page}
                className="w-1/2 p-8 bg-[#fefdfb] flex flex-col justify-between"
                initial={{ rotateY: page % 2 === 0 ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: page % 2 === 0 ? 90 : -90, opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformOrigin: page % 2 === 0 ? "right center" : "left center" }}
              >
                {page === 1 ? (
                  <>
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="text-2xl font-semibold text-gray-800">Descripción</h3>
                    </div>
                    <div className="bg-white border border-[#e5e2d9] shadow-inner rounded-xl p-5 text-gray-700 leading-relaxed min-h-[350px] max-h-[450px] overflow-y-auto">
                      {descripcion || "Sin descripción disponible."}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <ImageIcon className="w-5 h-5 text-pink-500 mr-2" /> Galería página {page - 1}
                    </h3>
                    {currentImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {currentImages.map((img) => (
                          <motion.img
                            key={img.id}
                            src={img.imagen_url}
                            alt={img.descripcion || "Imagen"}
                            className="rounded-lg shadow-sm border border-gray-200 object-cover h-40 w-full"
                            whileHover={{ scale: 1.05 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Sin imágenes adicionales.</p>
                    )}
                  </>
                )}

                {/* 📖 Control de páginas */}
                <div className="flex flex-col items-center mt-6 space-y-3">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          page === i + 1 ? "bg-blue-600 scale-110" : "bg-gray-400"
                        }`}
                        animate={{ scale: page === i + 1 ? 1.2 : 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 disabled:opacity-40"
                    >
                      <ArrowLeftCircle className="w-5 h-5 mr-1" /> Anterior
                    </button>
                    <span className="text-gray-500 text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 disabled:opacity-40"
                    >
                      Siguiente <ArrowRightCircle className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModalBook;
