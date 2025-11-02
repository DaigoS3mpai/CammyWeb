import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenText,
  FlaskConical,
  Image as ImageIcon,
  PlusCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import DetailModalBook from "./DetailModalBook";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Cargar datos según categoría
  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";

      switch (categoryName) {
        case "bitacora":
          endpoint = "/.netlify/functions/getClases";
          break;
        case "proyectos":
          endpoint = "/.netlify/functions/getProyectos";
          break;
        case "galeria":
          endpoint = "/.netlify/functions/getGaleria";
          break;
        default:
          setItems([]);
          setLoading(false);
          return;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryName]);

  // 🔁 Recarga dinámica desde localStorage
  useEffect(() => {
    const reloadFlags = {
      bitacora: "reloadBitacora",
      proyectos: "reloadProyectos",
      galeria: "reloadGaleria",
    };
    const key = reloadFlags[categoryName];

    const handleStorageChange = () => {
      if (key && localStorage.getItem(key) === "true") {
        fetchData();
        localStorage.removeItem(key);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [categoryName]);

  // 🔹 Abrir / cerrar detalle
  const handleCloseDetail = (updated = false) => {
    setShowModal(false);
    setSelectedItem(null);
    setSelectedType(null);
    if (updated) fetchData();
  };

  const handleOpenDetail = (item, type = categoryName) => {
    setSelectedItem(item);
    setSelectedType(type);
    setShowModal(true);
  };

  // 🔹 Config visual
  const config =
    {
      bitacora: {
        title: "Bitácora de Clases",
        description:
          "Aquí encontrarás el registro completo de todas las clases realizadas.",
        icon: <BookOpenText className="w-12 h-12 text-blue-300" />,
        buttonText: "Nueva Clase",
        buttonRoute: "/new-class",
      },
      proyectos: {
        title: "Proyectos Realizados",
        description:
          "Explora todos los proyectos desarrollados durante las clases.",
        icon: <FlaskConical className="w-12 h-12 text-purple-300" />,
        buttonText: "Nuevo Proyecto",
        buttonRoute: "/newproject",
      },
      galeria: {
        title: "Galería de Imágenes",
        description:
          "Disfruta de todas las imágenes capturadas de tus proyectos y clases.",
        icon: <ImageIcon className="w-12 h-12 text-pink-300" />,
        buttonText: "Ver Galería Completa",
        buttonRoute: "/gallery",
      },
    }[categoryName] || {
      title: "Categoría no encontrada",
      description: "La sección que buscas no existe.",
      icon: <FileText className="w-12 h-12 text-gray-300" />,
    };

  return (
    <motion.div
      className="flex-1 p-10 overflow-y-auto text-white min-h-screen bg-cover bg-center bg-fixed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundImage: "url('/bc.png')",
      }}
    >
      {/* 🔹 Encabezado */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="inline-flex items-center justify-center mb-4 p-4 rounded-full border border-white/50 bg-black/40 backdrop-blur-sm shadow-lg">
          {config.icon}
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          {config.title}
        </h1>
        <p className="text-gray-200 max-w-2xl mx-auto text-lg drop-shadow-sm">
          {config.description}
        </p>
      </motion.div>

      {/* 🔹 Botón admin */}
      {isAdmin() && categoryName !== "galeria" && (
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => navigate(config.buttonRoute)}
            className="flex items-center px-6 py-3 rounded-xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle className="w-5 h-5 mr-2 text-pink-300" />
            {config.buttonText}
          </motion.button>
        </div>
      )}

      {/* 🔹 Contenido principal */}
      {loading ? (
        <p className="text-center text-gray-200 mt-20 text-lg">
          Cargando contenido...
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-200 mt-20 text-lg">
          No hay registros en esta categoría.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id || index}
              className="p-6 rounded-2xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleOpenDetail(item)}
            >
              {categoryName === "galeria" && item.imagen_url && (
                <img
                  src={item.imagen_url}
                  alt={item.descripcion || "Imagen"}
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-xl font-semibold text-white mb-2">
                {item.titulo || item.proyecto_titulo || "Sin título"}
              </h3>
              <p className="text-gray-200 mb-3 line-clamp-3">
                {item.descripcion || "Sin descripción"}
              </p>

              {item.fecha || item.fecha_inicio ? (
                <div className="flex items-center text-sm text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(
                    item.fecha || item.fecha_inicio
                  ).toLocaleDateString("es-CL")}
                </div>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 🔹 Modal tipo libro */}
      <AnimatePresence>
        {showModal && selectedItem && (
          <DetailModalBook
            item={selectedItem}
            type={selectedType || categoryName}
            onClose={(updated) => handleCloseDetail(updated)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategoryPage;
