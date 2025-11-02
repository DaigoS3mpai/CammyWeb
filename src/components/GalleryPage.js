import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, PlusCircle, Loader2, X, Upload } from "lucide-react";

const GalleryPage = () => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState({
    imagen_url: "",
    descripcion: "",
    proyecto_id: "",
  });
  const [proyectos, setProyectos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔹 Cargar galería y proyectos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galeriaRes, proyectosRes] = await Promise.all([
          fetch("/.netlify/functions/getGaleria"),
          fetch("/.netlify/functions/getProyectos"),
        ]);

        const galeriaData = await galeriaRes.json();
        const proyectosData = await proyectosRes.json();

        setImagenes(galeriaData);
        setProyectos(proyectosData);
      } catch (err) {
        console.error("Error al cargar galería:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🖼️ Subir imagen a Cloudinary
  const uploadToCloudinary = async (file) => {
    const cloudName =
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // 🧩 Manejar selección de archivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setNuevaImagen((prev) => ({ ...prev, imagen_url: url }));
      alert("✅ Imagen subida correctamente a Cloudinary");
    } catch (err) {
      console.error("Error al subir imagen:", err);
      alert("❌ No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nuevaImagen.imagen_url || !nuevaImagen.proyecto_id) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      const res = await fetch("/.netlify/functions/addImagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaImagen),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Imagen añadida correctamente");
        setImagenes((prev) => [data.imagen, ...prev]);
        setNuevaImagen({ imagen_url: "", descripcion: "", proyecto_id: "" });
        setShowForm(false);
      } else {
        alert("❌ Error: " + (data.error || "No se pudo subir la imagen."));
      }
    } catch (error) {
      console.error("Error al guardar en base de datos:", error);
      alert("Ocurrió un error al conectar con el servidor.");
    }
  };

  return (
    <motion.div
      className="flex-1 p-10 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(to bottom right, #b3e5fc, #c8e6c9)",
      }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Galería de Imágenes
      </motion.h1>

      {/* Botón para añadir imagen */}
      <div className="flex justify-center mb-8">
        <motion.button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center shadow-lg hover:bg-pink-700 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {showForm ? "Cancelar" : "Añadir Imagen"}
        </motion.button>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Subir archivo */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Subir imagen
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="border border-gray-300 rounded-xl p-2 w-full"
                />
                {uploading && (
                  <Loader2 className="animate-spin w-6 h-6 text-pink-600" />
                )}
              </div>
              {nuevaImagen.imagen_url && (
                <img
                  src={nuevaImagen.imagen_url}
                  alt="Vista previa"
                  className="w-full mt-3 rounded-xl shadow-md"
                />
              )}
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Descripción
              </label>
              <textarea
                value={nuevaImagen.descripcion}
                onChange={(e) =>
                  setNuevaImagen({
                    ...nuevaImagen,
                    descripcion: e.target.value,
                  })
                }
                placeholder="Describe brevemente la imagen..."
                rows="3"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
            </div>

            {/* Proyecto asociado */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Proyecto asociado
              </label>
              <select
                value={nuevaImagen.proyecto_id}
                onChange={(e) =>
                  setNuevaImagen({
                    ...nuevaImagen,
                    proyecto_id: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                required
              >
                <option value="">Selecciona un proyecto</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-xl transition-all flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6 mr-2" /> Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-2" /> Guardar Imagen
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Galería */}
      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <Loader2 className="animate-spin w-8 h-8 text-pink-600" />
        </div>
      ) : imagenes.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No hay imágenes disponibles. ¡Sube la primera! 📸
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {imagenes.map((img) => (
            <motion.div
              key={img.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedImage(img)}
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={img.imagen_url}
                  alt={img.descripcion || "Imagen de proyecto"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {img.proyecto_titulo || "Proyecto sin nombre"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {img.descripcion || "Sin descripción"}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal para ver imagen ampliada */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full mx-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <img
                src={selectedImage.imagen_url}
                alt="Vista ampliada"
                className="w-full h-[500px] object-contain bg-black"
              />
              <div className="p-4 text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedImage.proyecto_titulo}
                </h2>
                <p className="text-gray-600 mt-2">
                  {selectedImage.descripcion || "Sin descripción"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GalleryPage;
