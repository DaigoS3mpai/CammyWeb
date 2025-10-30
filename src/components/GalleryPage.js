import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, PlusCircle, Loader2, X, Upload } from "lucide-react";

const GalleryPage = () => {
  const [imagenes, setImagenes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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

  // 🔹 Manejar selección de archivos
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // 🔹 Subir múltiples imágenes
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || selectedFiles.length === 0) {
      alert("Por favor selecciona un proyecto y al menos una imagen.");
      return;
    }

    setLoading(true);

    try {
      for (const file of selectedFiles) {
        // En este punto puedes implementar tu subida a un bucket o URL externa
        // Por ahora asumimos que se ingresa una URL manual o se procesa en el backend
        const imagen_url = URL.createObjectURL(file);

        const res = await fetch("/.netlify/functions/addImagen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagen_url,
            descripcion,
            proyecto_id: selectedProject,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setImagenes((prev) => [data.imagen, ...prev]);
        } else {
          console.error("❌ Error al subir imagen:", data.error);
        }
      }

      alert("✅ Imágenes añadidas correctamente");
      setDescripcion("");
      setSelectedFiles([]);
      setShowForm(false);
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      alert("Ocurrió un error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Agrupar imágenes por proyecto
  const imagenesPorProyecto = proyectos.map((p) => ({
    ...p,
    imagenes: imagenes.filter((img) => img.proyecto_id === p.id),
  }));

  return (
    <motion.div
      className="flex-1 p-10 bg-gradient-to-br from-pink-50 to-purple-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-700 mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Galería de Proyectos
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
          {showForm ? "Cancelar" : "Añadir Imágenes"}
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
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Proyecto asociado *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
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

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Descripción general (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente las imágenes..."
                rows="3"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Seleccionar imágenes *
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 cursor-pointer"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedFiles.length} imagen(es) seleccionada(s)
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-xl transition-all flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-5 h-5 mr-2" /> Subir Imágenes
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Galería agrupada por proyecto */}
      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <Loader2 className="animate-spin w-8 h-8 text-pink-600" />
        </div>
      ) : imagenes.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No hay imágenes disponibles. ¡Sube la primera! 📸
        </p>
      ) : (
        imagenesPorProyecto.map((proyecto) => (
          <div key={proyecto.id} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {proyecto.titulo}
            </h2>
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
              {proyecto.imagenes.length > 0 ? (
                proyecto.imagenes.map((img) => (
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
                      <p className="text-gray-600 text-sm mt-1">
                        {img.descripcion || "Sin descripción"}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center col-span-full italic">
                  No hay imágenes para este proyecto.
                </p>
              )}
            </motion.div>
          </div>
        ))
      )}

      {/* Modal de imagen ampliada */}
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
