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

  const [linkedClases, setLinkedClases] = useState([]); // 🔹 Clases vinculadas a proyectos
  const [editMode, setEditMode] = useState(false);
  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [descripcion, setDescripcion] = useState(item?.descripcion || "");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [allProyectos, setAllProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState(item?.proyecto_id || "");
  const [nuevasImagenes, setNuevasImagenes] = useState([]);

  // 🔹 Cargar lista de proyectos (solo si estamos editando una clase)
  useEffect(() => {
    if (type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then((res) => res.json())
        .then((data) => setAllProyectos(data))
        .catch(() => setAllProyectos([]));
    }
  }, [type]);

  // 🔹 Cargar clases vinculadas al proyecto actual
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
      transition: { type: "spring", stiffness: 90, damping: 15 },
    },
    exit: { rotateY: -90, opacity: 0, scale: 0.9 },
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;

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

      if (!res.ok) throw new Error("Error al guardar");

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
      alert("❌ No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-6"
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
              className="relative shadow-2xl rounded-2xl w-full max-w-[1100px] min-h-[650px] flex overflow-hidden border border-[#b29d84]"
              variants={bookVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                background: "linear-gradient(to right, #f9f5ef, #f8f3e9)",
                boxShadow:
                  "0 0 30px rgba(0,0,0,0.3), inset 0 0 25px rgba(97,72,44,0.15)",
              }}
            >
              {/* 📘 Encuadernado */}
              <div className="absolute inset-y-0 left-1/2 w-[3px] bg-[#c8b49d] shadow-inner z-10"></div>

              {/* Botones superiores */}
              <div className="absolute top-4 right-4 flex space-x-2 z-20">
                {isAdmin() && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 shadow-md"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-md"
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
                  className="bg-[#f0e9de] hover:bg-[#e9e0d2] rounded-full p-2"
                >
                  <X className="w-5 h-5 text-[#5a4633]" />
                </button>
              </div>

              {/* Página izquierda */}
              <div className="w-1/2 p-8 bg-[#faf6f1] flex flex-col justify-between border-r border-[#d9c6ab]">
                <div>
                  {/* 🔹 Título */}
                  <div className="flex items-center mb-6">
                    {type === "proyectos" ? (
                      <FlaskConical className="w-8 h-8 text-[#7a4e27] mr-3" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-[#795548] mr-3" />
                    )}
                    {editMode ? (
                      <input
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="text-3xl font-bold text-[#4e3c2b] border-b border-[#bca988] bg-transparent focus:outline-none w-full"
                      />
                    ) : (
                      <h2 className="text-3xl font-extrabold text-[#4e3c2b]">
                        {titulo}
                      </h2>
                    )}
                  </div>

                  {/* 🔹 Fecha */}
                  {fecha && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-5 h-5 text-[#795548] mr-2" />
                        <h3 className="text-lg font-semibold text-[#5b4532]">
                          Fecha
                        </h3>
                      </div>
                      <p className="text-[#6a5846] italic">{fecha}</p>
                    </div>
                  )}

                  {/* 🔹 Proyecto vinculado (solo en bitácora) */}
                  {type === "bitacora" && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Layers className="w-5 h-5 text-[#7a4e27] mr-2" />
                        <h3 className="text-lg font-semibold text-[#5b4532]">
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
                      ) : item.proyecto_titulo ? (
                        <p className="text-[#4e3c2b] font-semibold">
                          {item.proyecto_titulo}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Sin proyecto vinculado.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 🔹 Clases vinculadas (solo en proyectos) */}
                  {type === "proyectos" &&
                    linkedClases.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center mb-2">
                          <BookOpen className="w-5 h-5 text-[#7a4e27] mr-2" />
                          <h3 className="text-lg font-semibold text-[#5b4532]">
                            Clases vinculadas
                          </h3>
                        </div>
                        <ul className="list-disc list-inside text-[#4e3c2b] space-y-1">
                          {linkedClases.map((clase) => (
                            <li key={clase.id}>{clase.titulo}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Imagen principal */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#5b4532] flex items-center mb-2">
                    <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" /> Imagen
                    principal
                  </h3>
                  {item.imagen_portada ? (
                    <img
                      src={item.imagen_portada}
                      alt={titulo}
                      className="w-full rounded-xl shadow-md border border-[#d1bda1] object-cover max-h-[300px]"
                    />
                  ) : (
                    <p className="text-[#9c8973] italic">Sin imagen de portada.</p>
                  )}
                </div>
              </div>

              {/* Página derecha */}
              <div className="w-1/2 p-8 bg-[#fefbf6] flex flex-col justify-between">
                {page === 1 ? (
                  <>
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-[#795548] mr-2" />
                      <h3 className="text-2xl font-semibold text-[#4e3c2b]">
                        Descripción
                      </h3>
                    </div>
                    {editMode ? (
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="15"
                        className="w-full h-[350px] p-3 border border-[#d3c2aa] rounded-xl focus:ring-2 focus:ring-amber-600 resize-none bg-[#fffdf9] text-[#4e3c2b]"
                      />
                    ) : (
                      <div className="bg-[#fffdf9] border border-[#e5d5bc] shadow-inner rounded-xl p-5 text-[#4e3c2b] leading-relaxed min-h-[350px] max-h-[450px] overflow-y-auto">
                        {descripcion || "Sin descripción disponible."}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-[#5b4532] mb-3 flex items-center">
                      <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" /> Galería completa
                    </h3>

                    {/* 👇 Input de nuevas imágenes (solo modo edición) */}
                    {type === "proyectos" && editMode && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#5b4532] mb-1">
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
                            className="rounded-lg shadow-sm border border-[#d1bda1] object-cover h-40 w-full"
                            whileHover={{ scale: 1.05 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#9c8973] italic">
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
                      page === 1 ? "text-[#7a4e27]" : "text-[#9c8973]"
                    }`}
                  >
                    <ArrowLeftCircle className="w-5 h-5 mr-1" /> Página 1
                  </button>
                  {type === "proyectos" && (
                    <button
                      onClick={() => setPage(2)}
                      className={`flex items-center text-sm font-semibold ${
                        page === 2 ? "text-[#7a4e27]" : "text-[#9c8973]"
                      }`}
                    >
                      Página 2 <ArrowRightCircle className="w-5 h-5 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModalBook;
