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
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [zoomed, setZoomed] = useState(false);

  // 🔸 NUEVO: multimedia (imagenes + videos) y subida
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  // 🔹 Cargar lista de proyectos (solo si estamos en clase)
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

  // 🔹 Cargar galería asociada (imagenes y videos)
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

  // 🔹 NUEVO: al editar una clase, ir automáticamente a la página 2
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

  // Compatibilidad: subida solo de imágenes
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

      // Compatibilidad: subida de imágenes antiguas
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

      // Nueva subida multimedia (solo imágenes en clases)
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const uploaded = await uploadToCloudinary(file);
          if (uploaded?.url) {
            // Bloquear videos si es clase
            if (type === "bitacora" && uploaded.tipo === "video") continue;

            await fetch("/.netlify/functions/addImagen", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imagen_url: uploaded.url,
                descripcion: `Archivo agregado a ${titulo}`,
                tipo: uploaded.tipo,
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

  // 🔹 NUEVO: permitir página 2 al editar clase (aunque no haya multimedia)
  const mediaPerPage = 5;
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
              {/* resto del contenido idéntico... */}

              {/* 📖 Control de páginas */}
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
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModalBook;
