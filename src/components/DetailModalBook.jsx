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
  Pencil,
  Save,
  ArrowLeftCircle,
  ArrowRightCircle,
  Loader2,
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

  // 🔹 Cargar lista de proyectos (para bitácora)
  useEffect(() => {
    if (type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then((res) => res.json())
        .then((data) => setAllProyectos(data))
        .catch(() => setAllProyectos([]));
    }
  }, [type]);

  // 🔹 Cargar clases vinculadas a un proyecto
  useEffect(() => {
    if (type === "proyectos" && item?.id) {
      fetch("/.netlify/functions/getClases")
        .then((res) => res.json())
        .then((data) => {
          const relacionadas = data.filter((c) => c.proyecto_id === item.id);
          setLinkedClases(relacionadas);
        })
        .catch(() => setLinkedClases([]));
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

  const bookVariants = {
    hidden: { rotateY: 90, opacity: 0, scale: 0.9 },
    visible: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 18 },
    },
    exit: { rotateY: -90, opacity: 0, scale: 0.9 },
  };

  // 🔁 Navegar entre secciones vinculadas
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

  // ☁️ Subir imagen a Cloudinary
  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      alert("⚠️ No se configuraron variables de Cloudinary.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  // 📝 Guardar cambios
  const handleSave = async () => {
    if (!titulo.trim()) {
      alert("El título no puede estar vacío.");
      return;
    }

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

      if (!res.ok) throw new Error("Error al guardar cambios");

      // 🔹 Subir imágenes nuevas (solo proyectos)
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
      alert("❌ No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
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
              className="relative bg-gradient-to-br from-[#f9f8f5] to-[#f3f2ee] shadow-2xl rounded-2xl w-full max-w-[1100px] min-h-[650px] flex overflow-hidden border border-[#d8d5cc]"
              variants={bookVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Botones superiores */}
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
                      {saving ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-gray-300 hover:bg-gray-400 rounded-full p-2 shadow-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => onClose(false)}
                  className="bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Página izquierda */}
              <motion.div
                className="w-1/2 p-8 bg-[#fbfaf8] flex flex-col justify-between border-r border-[#dcd8ce]"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
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
                      <h2 className="text-3xl font-extrabold text-gray-800">
                        {titulo}
                      </h2>
                    )}
                  </div>

                  {fecha && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Fecha
                        </h3>
                      </div>
                      <p className="text-gray-600">{fecha}</p>
                    </div>
                  )}

                  {/* Proyecto vinculado (solo en bitácora) */}
                  {type === "bitacora" && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Layers className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Proyecto vinculado
                        </h3>
                      </div>
                      {editMode ? (
                        <select
                          value={proyectoId || ""}
                          onChange={(e) => setProyectoId(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-2"
                        >
                          <option value="">Sin vincular</option>
                          {allProyectos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.titulo}
                            </option>
                          ))}
                        </select>
                      ) : item.proyecto_id ? (
                        <button
                          onClick={() =>
                            handleNavigate(item.proyecto_id, "proyecto")
                          }
                          className="text-purple-600 hover:underline font-semibold"
                        >
                          {item.proyecto_titulo ||
                            proyectoTitulo ||
                            `Proyecto #${item.proyecto_id}`}
                        </button>
                      ) : (
                        <p className="text-gray-500 italic">
                          Sin proyecto vinculado.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Clases vinculadas (solo proyectos) */}
                  {type === "proyectos" && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Clases vinculadas
                        </h3>
                      </div>
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
                        <p className="text-gray-500 italic">
                          Sin clases vinculadas.
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
                      alt={titulo}
                      className="w-full rounded-xl shadow-md border border-gray-200 object-cover max-h-[300px]"
                    />
                  ) : (
                    <p className="text-gray-500 italic">
                      Sin imagen de portada.
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Página derecha */}
              <motion.div
                className="w-1/2 p-8 bg-[#fefdfb] flex flex-col justify-between"
                initial={{ rotateY: -180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              >
                {page === 1 ? (
                  <>
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="text-2xl font-semibold text-gray-800">
                        Descripción
                      </h3>
                    </div>
                    {editMode ? (
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="15"
                        className="w-full h-[350px] p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="Escribe aquí la descripción del proyecto..."
                      />
                    ) : (
                      <div className="bg-white border border-[#e5e2d9] shadow-inner rounded-xl p-5 text-gray-700 leading-relaxed min-h-[350px] max-h-[450px] overflow-y-auto">
                        {descripcion || "Sin descripción disponible."}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <ImageIcon className="w-5 h-5 text-pink-500 mr-2" /> Galería completa
                    </h3>

                    {/* 👇 Restauramos input de agregar imágenes en modo edición */}
                    {type === "proyectos" && editMode && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Agregar imágenes nuevas:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            setNuevasImagenes(Array.from(e.target.files))
                          }
                          className="border border-gray-300 rounded-lg p-2 w-full"
                        />
                      </div>
                    )}

                    {item.imagenes?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {item.imagenes.map((img) => (
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
                      <p className="text-gray-500 italic">
                        Sin imágenes adicionales.
                      </p>
                    )}
                  </>
                )}

                {/* 📖 Control de páginas */}
                <div className="flex justify-center mt-6 space-x-6">
                  <button
                    onClick={() => setPage(1)}
                    className={`flex items-center text-sm font-semibold ${
                      page === 1 ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    <ArrowLeftCircle className="w-5 h-5 mr-1" /> Página 1
                  </button>
                  {type === "proyectos" && (
                    <button
                      onClick={() => setPage(2)}
                      className={`flex items-center text-sm font-semibold ${
                        page === 2 ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      Página 2{" "}
                      <ArrowRightCircle className="w-5 h-5 ml-1" />
                    </button>
                  )}
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
