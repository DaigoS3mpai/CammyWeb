import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  FlaskConical,
  Image as ImageIcon,
  Loader2,
  FileText,
  Pencil,
  Save,
  PlusCircle,
  Link2,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const DetailModal = ({ item, type, onClose }) => {
  const { isAdmin } = useAuth();
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    imagen_portada: "",
    proyecto_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [proyectos, setProyectos] = useState([]); // 🔹 para vincular clase a proyecto

  // 🔹 Inicializar datos
  useEffect(() => {
    if (item) {
      setFormData({
        titulo: item.titulo || "",
        descripcion: item.descripcion || "",
        fecha_inicio: item.fecha_inicio || item.fecha || "",
        imagen_portada: item.imagen_portada || "",
        proyecto_id: item.proyecto_id || null,
      });
    }
  }, [item]);

  // 🔹 Cargar proyectos (solo si se edita una clase)
  useEffect(() => {
    if (type === "bitacora" && isAdmin()) {
      const fetchProyectos = async () => {
        try {
          const res = await fetch("/.netlify/functions/getProyectos");
          const data = await res.json();
          setProyectos(data);
        } catch (err) {
          console.error("Error al cargar proyectos:", err);
        }
      };
      fetchProyectos();
    }
  }, [type]);

  // 🔹 Cargar imágenes asociadas
  useEffect(() => {
    if (type === "proyectos" && item?.id) {
      const fetchImagenes = async () => {
        try {
          const res = await fetch("/.netlify/functions/getGaleria");
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

  // 🔹 Guardar cambios
  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint =
        type === "proyectos"
          ? "/.netlify/functions/updateProyecto"
          : "/.netlify/functions/updateClase";

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...formData }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Cambios guardados correctamente");
        setEditMode(false);
        localStorage.setItem("reloadProyectos", "true");
        localStorage.setItem("reloadBitacora", "true");
        onClose();
      } else {
        alert("❌ Error al guardar: " + (data.error || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Subir imagen de portada
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("⚠️ Faltan las variables de Cloudinary en Netlify.");
      return;
    }

    const formDataImg = new FormData();
    formDataImg.append("file", file);
    formDataImg.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataImg,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData((prev) => ({ ...prev, imagen_portada: data.secure_url }));
      } else {
        alert("❌ Error al subir imagen: " + (data.error?.message || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      alert("Error al conectar con Cloudinary.");
    }
  };

  // 🔹 Subir imagen a galería
  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !item?.id) return;

    setUploadingGallery(true);

    try {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

      const formDataImg = new FormData();
      formDataImg.append("file", file);
      formDataImg.append("upload_preset", uploadPreset);

      // 1️⃣ Subir a Cloudinary
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataImg,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Error subiendo a Cloudinary");

      // 2️⃣ Guardar en base de datos
      const dbRes = await fetch("/.netlify/functions/addImagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagen_url: uploadData.secure_url,
          descripcion: "Imagen agregada al proyecto",
          proyecto_id: item.id,
        }),
      });

      const dbData = await dbRes.json();
      if (!dbRes.ok) throw new Error(dbData.error || "Error guardando en DB");

      alert("✅ Imagen agregada correctamente a la galería.");
      setImagenes((prev) => [...prev, dbData.imagen]);
    } catch (err) {
      console.error("Error al agregar imagen:", err);
      alert("❌ Error: " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botones superiores */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {isAdmin() && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-2 transition"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            {isAdmin() && editMode && (
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-8 overflow-y-auto max-h-[90vh] space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
              {type === "proyectos" ? (
                <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />
              ) : (
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              )}
              {formData.titulo}
            </h2>

            {/* 🔹 Mostrar vínculo con proyecto (solo en clases) */}
            {type === "bitacora" && (
              <section className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <div className="flex items-center mb-3">
                  <Link2 className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Proyecto vinculado
                  </h3>
                </div>

                {isAdmin() && editMode ? (
                  <select
                    value={formData.proyecto_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proyecto_id: e.target.value || null,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sin proyecto</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titulo}
                      </option>
                    ))}
                  </select>
                ) : formData.proyecto_id ? (
                  <p className="text-gray-700 text-lg font-medium">
                    🔗 {item.proyecto_titulo || "Proyecto vinculado"}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No está vinculado a ningún proyecto.</p>
                )}
              </section>
            )}

            {/* Imagen principal y galería (igual que antes) */}
            {type === "proyectos" && (
              <>
                <section>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <ImageIcon className="w-6 h-6 mr-2 text-purple-500" />
                    Imagen principal
                  </h3>
                  {formData.imagen_portada ? (
                    <img
                      src={formData.imagen_portada}
                      alt={formData.titulo}
                      className="w-full max-h-[450px] object-cover rounded-2xl shadow-md"
                    />
                  ) : (
                    <p className="text-gray-500 italic">Sin imagen de portada.</p>
                  )}
                </section>

                {isAdmin() && (
                  <div className="text-center mt-6">
                    <label className="inline-flex items-center bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-pink-600 cursor-pointer">
                      <PlusCircle className="w-5 h-5 mr-2" />
                      {uploadingGallery ? "Subiendo..." : "Agregar imagen a galería"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                      />
                    </label>
                  </div>
                )}

                <section>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <ImageIcon className="w-6 h-6 mr-2 text-pink-500" />
                    Galería del Proyecto
                  </h3>

                  {loading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="animate-spin w-8 h-8 text-pink-500" />
                    </div>
                  ) : imagenes.length === 0 ? (
                    <p className="text-gray-500 italic">No hay imágenes asociadas.</p>
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
                          <div className="p-3 text-sm text-gray-600 text-center bg-gray-50">
                            {img.descripcion || "Sin descripción"}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailModal;
