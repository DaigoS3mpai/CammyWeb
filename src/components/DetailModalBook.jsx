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
  PlayCircle,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const DetailModalBook = ({ item, type, onClose }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [linkedClases, setLinkedClases] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [descripcion, setDescripcion] = useState(item?.descripcion || "");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [allProyectos, setAllProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState(item?.proyecto_id || "");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  // 🔹 Cargar lista de proyectos si es clase
  useEffect(() => {
    if (type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setAllProyectos(data))
        .catch(() => setAllProyectos([]));
    }
  }, [type]);

  // 🔹 Cargar clases vinculadas si es proyecto
  useEffect(() => {
    if (type === "proyectos" && item?.id) {
      fetch("/.netlify/functions/getClases")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const relacionadas = data.filter((c) => c.proyecto_id === item.id);
            setLinkedClases(relacionadas);
          }
        })
        .catch(() => setLinkedClases([]));
    }
  }, [item, type]);

  // 🔹 Cargar galería
  useEffect(() => {
    if (!item?.id) return;
    fetch("/.netlify/functions/getGaleria")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return setMediaList([]);
        const filtradas =
          type === "proyectos"
            ? data.filter((g) => g.proyecto_id === item.id)
            : data.filter((g) => g.clase_id === item.id);
        setMediaList(filtradas);
      })
      .catch(() => setMediaList([]));
  }, [item, type]);

  // 🧮 Paginación dinámica
  const mediaPerPage = 5;
  const totalPages = 1 + Math.ceil(mediaList.length / mediaPerPage);
  const paginatedMedia =
    page > 1
      ? mediaList.slice((page - 2) * mediaPerPage, (page - 1) * mediaPerPage)
      : [];

  // 📅 Fecha formateada
  const fecha =
    item.fecha_inicio || item.fecha
      ? new Date(item.fecha_inicio || item.fecha).toLocaleDateString("es-CL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  // 📤 Subir a Cloudinary
  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;

    const isVideo = file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return { url: data.secure_url, tipo: isVideo ? "video" : "imagen" };
  };

  // 💾 Guardar cambios
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

      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 📤 Subida multimedia
      for (const file of mediaFiles) {
        const { url, tipo } = await uploadToCloudinary(file);
        if (url) {
          await fetch("/.netlify/functions/addImagen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imagen_url: url,
              descripcion: `Archivo agregado a ${titulo}`,
              tipo,
              proyecto_id: type === "proyectos" ? item.id : null,
              clase_id: type === "bitacora" ? item.id : null,
            }),
          });
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

  // 🔗 Navegación entre vínculos
  const openLinkedClase = (id) => {
    localStorage.setItem("openClaseId", id);
    localStorage.setItem("reloadBitacora", "true");
    navigate("/category/bitacora");
  };

  const openLinkedProyecto = (id) => {
    localStorage.setItem("openProyectoId", id);
    localStorage.setItem("reloadProyectos", "true");
    navigate("/category/proyectos");
  };

  const openInGaleria = (mediaId) => {
    localStorage.setItem("openGaleriaId", mediaId);
    localStorage.setItem("reloadGaleria", "true");
    navigate("/category/galeria");
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 md:p-6 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(false)}
        >
          <motion.div
            className="relative perspective-1000 w-full max-w-[950px] min-h-[550px] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="relative shadow-2xl rounded-2xl w-full h-full flex flex-col md:flex-row overflow-hidden border border-[#b29d84]"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              style={{
                background: "linear-gradient(to right, #f9f5ef, #f8f3e9)",
                boxShadow:
                  "0 0 30px rgba(0,0,0,0.3), inset 0 0 25px rgba(97,72,44,0.15)",
              }}
            >
              {/* 📘 Página izquierda */}
              <div className="md:w-1/2 p-6 md:p-8 bg-[#faf6f1] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d9c6ab] overflow-y-auto">
                <div>
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
                        className="text-2xl md:text-3xl font-bold text-[#4e3c2b] border-b border-[#bca988] bg-transparent focus:outline-none w-full"
                      />
                    ) : (
                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#4e3c2b]">
                        {titulo}
                      </h2>
                    )}
                  </div>

                  {fecha && (
                    <div className="mb-4">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-5 h-5 text-[#795548] mr-2" />
                        <h3 className="text-lg font-semibold text-[#5b4532]">
                          Fecha
                        </h3>
                      </div>
                      <p className="text-[#6a5846] italic">{fecha}</p>
                    </div>
                  )}

                  {/* 🔗 Proyecto vinculado */}
                  {type === "bitacora" && (
                    <div className="mb-5">
                      <div className="flex items-center mb-1">
                        <Layers className="w-5 h-5 text-[#7a4e27] mr-2" />
                        <h3 className="text-lg font-semibold text-[#5b4532]">
                          Proyecto vinculado
                        </h3>
                      </div>
                      {item.proyecto_titulo ? (
                        <button
                          onClick={() => openLinkedProyecto(item.proyecto_id)}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {item.proyecto_titulo}
                        </button>
                      ) : (
                        <p className="text-gray-500 italic">
                          Sin proyecto vinculado.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 📚 Clases vinculadas */}
                  {type === "proyectos" && linkedClases.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-5 h-5 text-[#7a4e27] mr-2" />
                        <h3 className="text-lg font-semibold text-[#5b4532]">
                          Clases vinculadas
                        </h3>
                      </div>
                      <ul className="list-disc list-inside text-[#4e3c2b] space-y-1">
                        {linkedClases.map((clase) => (
                          <li key={clase.id}>
                            <button
                              onClick={() => openLinkedClase(clase.id)}
                              className="text-blue-700 hover:underline font-medium"
                            >
                              {clase.titulo}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 📄 Página derecha */}
              <div className="md:w-1/2 p-6 md:p-8 bg-[#fefbf6] flex flex-col justify-between overflow-y-auto">
                {page === 1 ? (
                  <>
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-[#795548] mr-2" />
                      <h3 className="text-2xl font-semibold text-[#4e3c2b]">
                        Descripción
                      </h3>
                    </div>
                    <div className="bg-[#fffdf9] border border-[#e5d5bc] shadow-inner rounded-xl p-5 text-[#4e3c2b] leading-relaxed whitespace-pre-line">
                      {descripcion || "Sin descripción disponible."}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-[#5b4532] mb-3 flex items-center">
                      <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" />{" "}
                      Galería multimedia
                    </h3>

                    {paginatedMedia.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {paginatedMedia.map((media) => (
                          <motion.div
                            key={media.id}
                            whileHover={{ scale: 1.04 }}
                            className="relative group border border-[#d1bda1] rounded-xl overflow-hidden shadow-sm cursor-pointer"
                            onClick={() => openInGaleria(media.id)}
                          >
                            {media.tipo === "video" ? (
                              <div className="relative">
                                <video
                                  src={media.imagen_url}
                                  className="w-full h-48 object-cover rounded-xl"
                                  muted
                                  loop
                                />
                                <PlayCircle className="absolute inset-0 m-auto text-white opacity-90 w-10 h-10 drop-shadow-lg" />
                              </div>
                            ) : (
                              <img
                                src={media.imagen_url}
                                alt={media.descripcion || "Imagen"}
                                className="w-full h-48 object-cover rounded-xl"
                              />
                            )}

                            {/* 🔗 Proyecto o clase vinculado */}
                            <div className="bg-[#fff9f3] text-center text-[#5b4532] text-sm font-medium py-2 border-t border-[#d1bda1]">
                              {media.proyecto_titulo ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLinkedProyecto(media.proyecto_id);
                                  }}
                                  className="text-blue-700 hover:underline"
                                >
                                  {media.proyecto_titulo}
                                </button>
                              ) : media.clase_titulo ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLinkedClase(media.clase_id);
                                  }}
                                  className="text-blue-700 hover:underline"
                                >
                                  {media.clase_titulo}
                                </button>
                              ) : (
                                "Sin vínculo"
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#9c8973] italic">
                        Sin archivos multimedia.
                      </p>
                    )}
                  </>
                )}

                {/* 📖 Controles de páginas */}
                <div className="flex justify-center mt-6 space-x-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`flex items-center text-sm font-semibold ${
                      page === 1
                        ? "text-[#c7b9a7]"
                        : "text-[#7a4e27] hover:underline"
                    }`}
                  >
                    <ArrowLeftCircle className="w-5 h-5 mr-1" /> Anterior
                  </button>
                  <span className="text-[#5b4532] font-semibold">
                    Página {page}/{totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage(Math.min(totalPages, page + 1))
                    }
                    disabled={page === totalPages}
                    className={`flex items-center text-sm font-semibold ${
                      page === totalPages
                        ? "text-[#c7b9a7]"
                        : "text-[#7a4e27] hover:underline"
                    }`}
                  >
                    Siguiente <ArrowRightCircle className="w-5 h-5 ml-1" />
                  </button>
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
