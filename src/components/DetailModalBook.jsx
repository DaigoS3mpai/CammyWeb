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
  const [reflexion, setReflexion] = useState(item?.reflexion || "");
  const [imagenPortada, setImagenPortada] = useState(
    item?.imagen_portada || ""
  );

  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [allProyectos, setAllProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState(item?.proyecto_id || "");
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [zoomed, setZoomed] = useState(false);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  // 🔄 sincronizar cuando cambie el item
  useEffect(() => {
    if (!item) return;
    setTitulo(item.titulo || "");
    setDescripcion(item.descripcion || "");
    setReflexion(item.reflexion || "");
    setProyectoId(item.proyecto_id || "");
    setImagenPortada(item.imagen_portada || "");
  }, [item]);

  // 🔹 proyectos para clases
  useEffect(() => {
    if (type === "bitacora") {
      fetch("/.netlify/functions/getProyectos")
        .then((res) => res.json())
        .then((data) =>
          Array.isArray(data) ? setAllProyectos(data) : setAllProyectos([])
        )
        .catch(() => setAllProyectos([]));
    }
  }, [type]);

  // 🔹 clases vinculadas a un proyecto
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

  // 🔹 galería de la clase/proyecto
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

  // si estás editando una CLASE, llévala a la página 2
  useEffect(() => {
    if (editMode && type === "bitacora") {
      setPage(2);
    }
  }, [editMode, type]);

  const fecha =
    item?.fecha_inicio || item?.fecha
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

  // 🔼 Cloudinary genérico (IMAGEN + VIDEO) usando resource_type "auto"
  const uploadToCloudinary = async (file) => {
    const cloudName =
      process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("❌ Faltan variables de entorno de Cloudinary.");
      return null;
    }

    const isVideo = file.type?.startsWith("video/");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error Cloudinary:", data);
        return null;
      }

      return { url: data.secure_url, tipo: isVideo ? "video" : "imagen" };
    } catch (err) {
      console.error("❌ Error de red subiendo a Cloudinary:", err);
      return null;
    }
  };

  // 🔼 solo imagen (flujo antiguo)
  const uploadImageOnly = async (file) => {
    const cloudName =
      process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Error Cloudinary (imagen-only):", data);
      return null;
    }
    return data.secure_url;
  };

  // 🔼 portada nueva
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName =
      process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      alert("Faltan variables de entorno de Cloudinary.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Error Cloudinary portada:", data);
        throw new Error(data.error?.message || "Error al subir portada");
      }
      setImagenPortada(data.secure_url);
    } catch (err) {
      console.error(err);
      alert("❌ Error al subir la imagen de portada.");
    }
  };

  // usar una imagen existente como portada
  const handleSelectCoverFromGallery = (url) => {
    setImagenPortada(url);
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert("El título no puede estar vacío.");
      return;
    }

    setSaving(true);
    try {
      // 🆕 Caso especial: galería
      if (type === "galeria") {
        const res = await fetch("/.netlify/functions/updateImagen", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            titulo,
            descripcion,
          }),
        });

        if (!res.ok) throw new Error("Error al guardar imagen de galería.");
      } else {
        // proyectos / bitácora (clases)
        const endpoint =
          type === "proyectos"
            ? "/.netlify/functions/updateProyecto"
            : "/.netlify/functions/updateClase";

        const payload =
          type === "bitacora"
            ? {
                id: item.id,
                titulo,
                descripcion,
                reflexion,
                proyecto_id: proyectoId,
                imagen_portada: imagenPortada,
              }
            : {
                id: item.id,
                titulo,
                descripcion,
                imagen_portada: imagenPortada,
              };

        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Error al guardar");

        // flujo antiguo extra de imágenes (solo imágenes)
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

        // subida mediaFiles (galería) -> ahora acepta video también
        if (mediaFiles.length > 0) {
          for (const file of mediaFiles) {
            const uploaded = await uploadToCloudinary(file);
            if (uploaded?.url) {
              await fetch("/.netlify/functions/addImagen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imagen_url: uploaded.url,
                  descripcion: `Archivo agregado a ${titulo}`,
                  tipo: uploaded.tipo, // "video" o "imagen"
                  proyecto_id: type === "proyectos" ? item.id : null,
                  clase_id: type === "bitacora" ? item.id : null,
                }),
              });
            }
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

  // navegación desde vínculos
  const openLinkedClase = (claseId) => {
    localStorage.setItem("openClaseId", claseId);
    localStorage.setItem("reloadBitacora", "true");
    navigate("/category/bitacora");
  };

  const openLinkedProyecto = (proyectoId) => {
    localStorage.setItem("openProyectoId", proyectoId);
    localStorage.setItem("reloadProyectos", "true");
    navigate("/category/proyectos");
  };

  // paginación
  const mediaPerPage = 5;
  const totalPages =
    type === "galeria"
      ? 1
      : type === "bitacora" && editMode
      ? Math.max(2, 1 + Math.ceil(mediaList.length / mediaPerPage))
      : 2;

  const paginatedMedia =
    page === 2 ? mediaList.slice(0, mediaList.length) : [];

  // bloque de galería (para usar en la página 2 izquierda)
  const GalleryBlock = () => (
    <>
      <h3 className="text-lg font-semibold text-[#5b4532] mb-3 flex items-center">
        <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" /> Galería completa
      </h3>

      {editMode && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-[#5b4532] mb-1">
              Agregar archivos (imágenes o videos):
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => setMediaFiles(Array.from(e.target.files))}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>

          {type === "proyectos" && (
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
        </>
      )}

      {paginatedMedia.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {paginatedMedia.map((media) =>
            (media.tipo || "").toLowerCase() === "video" ? (
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
                  className="w-full h-28 object-cover"
                  muted
                  playsInline
                  loop
                />
                <PlayCircle className="absolute top-2 left-2 text-white drop-shadow-md" />
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
                  className="object-cover h-28 w-full"
                />
              </motion.div>
            )
          )}
        </div>
      ) : (
        <p className="text-[#9c8973] italic mt-2">Sin archivos multimedia.</p>
      )}
    </>
  );

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
              {/* encuadernado */}
              <div className="absolute inset-y-0 left-1/2 w-[3px] bg-[#c8b49d] shadow-inner z-10"></div>

              {/* botones superiores */}
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

              {/* PÁGINA IZQUIERDA */}
              <div className="w-1/2 p-8 bg-[#faf6f1] flex flex-col justify-start gap-6 border-r border-[#d9c6ab]">
                {type === "galeria" ? (
                  // modo galería
                  <div className="flex flex-col items-center text-center space-y-4">
                    {item.imagen_url ? (
                      (item.tipo || "").toLowerCase() === "video" ? (
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
                      <p className="text-gray-500 italic">
                        Sin multimedia disponible.
                      </p>
                    )}

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
                ) : page === 1 ? (
                  // 📄 Página 1 izquierda: Título + meta + portada
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
                              className="w-full border border-gray-400 textblack rounded-xl p-2 bg-white focus:ring-2 focus:ring-amber-600"
                            >
                              <option value="">
                                Selecciona un proyecto...
                              </option>
                              {allProyectos.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.titulo}
                                </option>
                              ))}
                            </select>
                          ) : item.proyecto_titulo ? (
                            <button
                              onClick={() =>
                                openLinkedProyecto(item.proyecto_id)
                              }
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

                      {type === "proyectos" && linkedClases.length > 0 && (
                        <div className="mt-2">
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

                    {/* portada */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-[#5b4532] flex items-center mb-2">
                        <ImageIcon className="w-5 h-5 text-[#a5754a] mr-2" />{" "}
                        Imagen principal
                      </h3>

                      {editMode ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#5b4532] mb-1">
                              Subir nueva imagen de portada
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="border border-gray-300 rounded-xl p-2 w-full bg-white"
                            />
                          </div>

                          {imagenPortada && (
                            <div>
                              <p className="text-xs text-[#7a6a57] mb-1">
                                Vista previa de la portada seleccionada:
                              </p>
                              <img
                                src={imagenPortada}
                                alt={titulo}
                                className="w-full rounded-xl shadow-md border border-[#d1bda1] object-cover max-h-[300px]"
                              />
                            </div>
                          )}

                          {mediaList.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-[#5b4532] mb-2">
                                O seleccionar una imagen existente de la
                                galería como portada:
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {mediaList
                                  .filter(
                                    (m) =>
                                      (m.tipo || "").toLowerCase() !== "video"
                                  )
                                  .map((media) => (
                                    <button
                                      key={media.id}
                                      type="button"
                                      onClick={() =>
                                        handleSelectCoverFromGallery(
                                          media.imagen_url
                                        )
                                      }
                                      className={`relative rounded-xl overflow-hidden border-2 ${
                                        imagenPortada === media.imagen_url
                                          ? "border-[#a5754a]"
                                          : "border-transparent"
                                      }`}
                                    >
                                      <img
                                        src={media.imagen_url}
                                        alt={media.descripcion || "Imagen"}
                                        className="w-full h-24 object-cover"
                                      />
                                      <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] py-1 text-center">
                                        Usar como portada
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : imagenPortada ? (
                        <img
                          src={imagenPortada}
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
                ) : (
                  // 📷 Página 2 izquierda: Galería completa
                  <GalleryBlock />
                )}
              </div>

              {/* PÁGINA DERECHA */}
              <div className="w-1/2 p-8 bg-[#fefbf6] flex flex-col justify-between">
                {type === "galeria" ? (
                  // Derecha para galería: título + descripción
                  <>
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-[#795548] mr-2" />
                      <h3 className="text-2xl font-semibold text-[#4e3c2b]">
                        Detalle del archivo
                      </h3>
                    </div>

                    {/* título visible cuando NO editas */}
                    {!editMode && (
                      <h2 className="text-2xl font-bold text-[#4e3c2b] mb-4 text-center">
                        {titulo || "Sin título"}
                      </h2>
                    )}

                    {editMode && (
                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-[#5b4532] mb-1">
                          Título del archivo
                        </label>
                        <input
                          type="text"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="w-full border border-[#d3c2aa] rounded-xl p-2 bg-[#fffdf9] text-[#4e3c2b] focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    )}

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
                ) : page === 1 ? (
                  // 📖 Página 1 derecha: Descripción
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
                  // ✍ Página 2 derecha: Reflexión
                  <>
                    <div className="flex items-center mb-3">
                      <FileText className="w-5 h-5 text-[#795548] mr-2" />
                      <h3 className="text-2xl font-semibold text-[#4e3c2b]">
                        Reflexión
                      </h3>
                    </div>
                    {editMode ? (
                      <textarea
                        value={reflexion}
                        onChange={(e) => setReflexion(e.target.value)}
                        rows="15"
                        className="w-full h-[350px] p-3 border border-[#d3c2aa] rounded-xl focus:ring-2 focus:ring-amber-600 resize-none bg-[#fffdf9] text-[#4e3c2b]"
                      />
                    ) : (
                      <div className="bg-[#fffdf9] border border-[#e5d5bc] shadow-inner rounded-xl p-5 text-[#4e3c2b] leading-relaxed min-h-[350px] max-h-[450px] overflow-y-auto whitespace-pre-line">
                        {reflexion || "Sin reflexión registrada."}
                      </div>
                    )}
                  </>
                )}

                {/* paginación (solo para proyectos/bitácora) */}
                {type !== "galeria" && (
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
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      className={`flex items-center text-sm font-semibold ${
                        page === totalPages
                          ? "text-[#c7b9a7]"
                          : "text-[#7a4e27] hover:underline"
                      }`}
                    >
                      Siguiente <ArrowRightCircle className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModalBook;
