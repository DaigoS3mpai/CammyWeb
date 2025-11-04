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
  const [nuevasImagenes, setNuevasImagenes] = useState([]); // ← se mantiene por compatibilidad
  const [zoomed, setZoomed] = useState(false);

  // 🔸 multimedia (imagenes + videos) y subida
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  // 🔹 Cargar lista de proyectos (solo si estamos en clase)
  useEffect(() => {
    if (type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then((res) => res.json())
        .then((data) => (Array.isArray(data) ? setAllProyectos(data) : setAllProyectos([])))
        .catch(() => setAllProyectos([]));
    }
  }, [type]);

  // 🔹 Cargar clases vinculadas al proyecto
  useEffect(() => {
    if (type === "proyectos" && item?.id) {
      fetch("/.netlify/functions/getClases")
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) return setLinkedClases([]);
          const relacionadas = data.filter((c) => c.proyecto_id === item.id);
          setLinkedClases(relacionadas);
        })
        .catch(() => setLinkedClases([]));
    }
  }, [item, type]);

  // 🔹 Cargar galería asociada (imagenes y videos) para paginar
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

  // 🆕 Al entrar en modo edición de una CLASE, pasar automáticamente a la página 2
  useEffect(() => {
    if (editMode && type === "bitacora") {
      setPage(2);
    }
  }, [editMode, type]);

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

  // 🔼 Subida a Cloudinary (imagen o video)
  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;

    const isVideo = file.type?.startsWith("video/");
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

  // (compatibilidad) subida de solo imagen para el flujo antiguo de proyectos
  const uploadImageOnly = async (file) => {
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

      // Compatibilidad: si usas el input antiguo (nuevasImagenes) en proyectos
      if (type === "proyectos" && nuevasImagenes.length > 0) {
        for (const file of nuevasImagenes) {
          const url = await uploadImageOnly(file);
          if (url) {
            await fetch("/.netlify/functions/addImagen", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imagen_url: url,
                descripcion: `Imagen agregada a ${titulo}`,
                tipo: "imagen",
                proyecto_id: item.id,
                clase_id: null,
              }),
            });
          }
        }
      }

      // Subida de mediaFiles (clases: solo imagen | proyectos: imagen+video)
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const uploaded = await uploadToCloudinary(file);
          if (uploaded?.url) {
            // 🆕 Blindaje: si es clase y resultó ser video, se ignora
            if (type === "bitacora" && uploaded.tipo === "video") continue;

            await fetch("/.netlify/functions/addImagen", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imagen_url: uploaded.url,
                descripcion: `Archivo agregado a ${titulo}`,
                tipo: uploaded.tipo, // "imagen" | "video"
                proyecto_id: type === "proyectos" ? item.id : null,
                clase_id: type === "bitacora" ? item.id : null,
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

  // 🔗 Navegar a clase desde proyecto
  const openLinkedClase = (claseId) => {
    localStorage.setItem("openClaseId", claseId);
    localStorage.setItem("reloadBitacora", "true");
    navigate("/category/bitacora");
  };

  // 🔗 Navegar a proyecto desde clase o galería
  const openLinkedProyecto = (proyectoId) => {
    localStorage.setItem("openProyectoId", proyectoId);
    localStorage.setItem("reloadProyectos", "true");
    navigate("/category/proyectos");
  };

  // 🧮 Paginación dinámica
  const mediaPerPage = 5;

  // 🆕 Si es CLASE y estás editando, asegura al menos 2 páginas (Descripción y Galería)
  const totalPages =
    type === "bitacora" && editMode
      ? Math.max(2, 1 + Math.ceil(mediaList.length / mediaPerPage))
      : 1 + Math.ceil(mediaList.length / mediaPerPage);

  const paginatedMedia =
    page > 1
      ? mediaList.slice((page - 2) * mediaPerPage, (page - 1) * mediaPerPage)
      : [];

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

              {/* 🔹 Botones superiores */}
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

              {/* 🔹 Página izquierda */}
              <div className="w-1/2 p-8 bg-[#faf6f1] flex flex-col justify-between border-r border-[#d9c6ab]">
                {/* 🖼️ Si el modal viene de galería, mostrar imagen grande y vínculo */}
                {type === "galeria" ? (
                  <div className="flex flex-col items-center text-center space-y-4">
                    {item.imagen_url ? (
                      item.tipo === "video" ? (
                        <motion.video
                          key={item.id}
                          src={item.imagen_url}
                          controls
                          className="w-full rounded-xl border border-[#d1bda1] max-h-[360px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      ) : (
                        <motion.img
                          src={item.imagen_url}
                          alt={item.descripcion || "Imagen"}
                          onClick={() => setZoomed(!zoomed)}
                          className={`rounded-xl shadow-md border border-[#d1bda1] object-contain cursor-pointer transition-all duration-300 ${
                            zoomed
                              ? "max-h-[550px] scale-105"
                              : "max-h-[360px] hover:scale-[1.02]"
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )
                    ) : (
                      <p className="text-gray-500 italic">Sin multimedia disponible.</p>
                    )}

                    {/* Vínculo al proyecto o clase debajo del media */}
                    <div className="text-sm">
                      {item.proyecto_id && item.proyecto_titulo && (
                        <button
                          onClick={() => openLinkedProyecto(item.proyecto_id)}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          Proyecto vinculado: {item.proyecto_titulo}
                        </button>
                      )}
                      {item.clase_id && item.clase_titulo && (
                        <button
                          onClick={() => openLinkedClase(item.clase_id)}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          Clase vinculada: {item.clase_titulo}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
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
                            className="text-3xl font-bold text-[#4e3c2b] border-b border-[#bca988] bg-transparent focus:outline-none w-full"
                          />
                        ) : (
                          <h2 className="text-3xl font-extrabold text-[#4e3c2b]">
                            {titulo}
                          </h2>
                        )}
                      </div>

                      {/* Fecha */}
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

                      {/* Proyecto vinculado */}
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
                              className="w-full border border-gray-400 text-black rounded-xl p-2 bg-white focus:ring-2 focus:ring-amber-600"
                            >
                              <option value="">Selecciona un proyecto...</option>
                              {allProyectos.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.titulo}
                                </option>
                              ))}
                            </select>
                          ) : item.proyecto_titulo ? (
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

                      {/* Clases vinculadas */}
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

                    {/* Imagen principal */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-[#5b4532] flex items-center mb-2">
                        <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" />{" "}
                        Imagen principal
                      </h3>
                      {item.imagen_portada ? (
                        <img
                          src={item.imagen_portada}
                          alt={titulo}
                          className="w-full rounded-xl shadow-md border border-[#d1bda1] object-cover max-h-[300px]"
                        />
                      ) : (
                        <p className="text-[#9c8973] italic">
                          Sin imagen de portada.
                        </p>
                      )}
                    </div>
                  </>
                )}
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
                      <div className="bg-[#fffdf9] border border-[#e5d5bc] shadow-inner rounded-xl p-5 text-[#4e3c2b] leading-relaxed min-h-[350px] max-h-[450px] overflow-y-auto whitespace-pre-line">
                        {descripcion || "Sin descripción disponible."}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-[#5b4532] mb-3 flex items-center">
                      <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" />{" "}
                      Galería completa
                    </h3>

                    {/* Input de subida unificado (clases: solo imagen | proyectos: imagen+video) */}
                    {editMode && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#5b4532] mb-1">
                          Agregar archivos ({type === "proyectos" ? "imágenes o videos" : "imágenes"}):
                        </label>
                        <input
                          type="file"
                          accept={type === "proyectos" ? "image/*,video/*" : "image/*"}
                          multiple
                          onChange={(e) => setMediaFiles(Array.from(e.target.files))}
                          className="border border-gray-300 rounded-lg p-2 w-full"
                        />
                      </div>
                    )}

                    {/* (compatibilidad) input anterior de solo imágenes para proyectos */}
                    {type === "proyectos" && editMode && (
                      <div className="mb-2">
                        <label className="block text-xs text-[#6b5a47] mb-1">
                          (Opcional) Agregar imágenes como antes:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setNuevasImagenes(Array.from(e.target.files))}
                          className="border border-gray-300 rounded-lg p-2 w-full"
                        />
                      </div>
                    )}

                    {/* Grid de multimedia paginado */}
                    {paginatedMedia.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {paginatedMedia.map((media) =>
                          media.tipo === "video" ? (
                            <motion.div
                              key={media.id}
                              className="group relative rounded-lg overflow-hidden border border-[#d1bda1] cursor-pointer"
                              whileHover={{ scale: 1.03 }}
                              onClick={() => {
                                localStorage.setItem("openGaleriaId", media.id);
                                localStorage.setItem("reloadGaleria", "true");
                                navigate("/category/galeria");
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <video
                                src={media.imagen_url}
                                className="w-full h-40 object-cover"
                                muted
                                playsInline
                                loop
                              />
                              <PlayCircle className="absolute top-2 left-2 text-white drop-shadow-md" />
                              {/* vínculo bajo el card */}
                              <div className="px-2 py-1 bg-[#fffaf3] text-[#4e3c2b] text-xs">
                                {media.proyecto_id && media.proyecto_titulo ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLinkedProyecto(media.proyecto_id);
                                    }}
                                    className="hover:underline"
                                  >
                                    Proyecto: {media.proyecto_titulo}
                                  </button>
                                ) : media.clase_id && media.clase_titulo ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLinkedClase(media.clase_id);
                                    }}
                                    className="hover:underline"
                                  >
                                    Clase: {media.clase_titulo}
                                  </button>
                                ) : null}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key={media.id}
                              className="rounded-lg overflow-hidden border border-[#d1bda1] cursor-pointer"
                              whileHover={{ scale: 1.03 }}
                              onClick={() => {
                                localStorage.setItem("openGaleriaId", media.id);
                                localStorage.setItem("reloadGaleria", "true");
                                navigate("/category/galeria");
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <img
                                src={media.imagen_url}
                                alt={media.descripcion || "Imagen"}
                                className="object-cover h-40 w-full"
                              />
                              <div className="px-2 py-1 bg-[#fffaf3] text-[#4e3c2b] text-xs">
                                {media.proyecto_id && media.proyecto_titulo ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLinkedProyecto(media.proyecto_id);
                                    }}
                                    className="hover:underline"
                                  >
                                    Proyecto: {media.proyecto_titulo}
                                  </button>
                                ) : media.clase_id && media.clase_titulo ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLinkedClase(media.clase_id);
                                    }}
                                    className="hover:underline"
                                  >
                                    Clase: {media.clase_titulo}
                                  </button>
                                ) : null}
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-[#9c8973] italic">Sin archivos multimedia.</p>
                    )}
                  </>
                )}

                {/* 📖 Control de páginas */}
                <div className="flex justify-center mt-6 space-x-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`flex items-center text-sm font-semibold ${
                      page === 1 ? "text-[#c7b9a7]" : "text-[#7a4e27] hover:underline"
                    }`}
                  >
                    <ArrowLeftCircle className="w-5 h-5 mr-1" /> Anterior
                  </button>
                  <span className="text-[#5b4532] font-semibold">
                    Página {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className={`flex items-center text-sm font-semibold ${
                      page === totalPages ? "text-[#c7b9a7]" : "text-[#7a4e27] hover:underline"
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
