import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenText,
  FlaskConical,
  Image as ImageIcon,
  Video,
  PlusCircle,
  Calendar,
  FileText,
  BookOpen,
  Layers,
  Images,
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

  // 🔹 Cargar datos
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

  // 🔁 Recarga desde localStorage
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

  // 🧭 Apertura automática de modales
  useEffect(() => {
    if (loading || items.length === 0) return;
    const openClaseId = localStorage.getItem("openClaseId");
    const openProyectoId = localStorage.getItem("openProyectoId");
    const openGaleriaId = localStorage.getItem("openGaleriaId");

    if (openClaseId && categoryName === "bitacora") {
      const itemToOpen = items.find((i) => i.id === parseInt(openClaseId));
      if (itemToOpen) handleOpenDetail(itemToOpen, "bitacora");
      localStorage.removeItem("openClaseId");
    }
    if (openProyectoId && categoryName === "proyectos") {
      const itemToOpen = items.find((i) => i.id === parseInt(openProyectoId));
      if (itemToOpen) handleOpenDetail(itemToOpen, "proyectos");
      localStorage.removeItem("openProyectoId");
    }
    if (openGaleriaId && categoryName === "galeria") {
      const itemToOpen = items.find((i) => i.id === parseInt(openGaleriaId));
      if (itemToOpen) handleOpenDetail(itemToOpen, "galeria");
      localStorage.removeItem("openGaleriaId");
    }
  }, [loading, items, categoryName]);

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

  // 🎨 Config visual con degradado oscuro animado
  const config =
    {
      bitacora: {
        title: "Bitácora de Clases",
        titleGradient: "from-sky-600 via-blue-600 to-cyan-500",
        description:
          "Aquí encontrarás el registro completo de todas las clases realizadas.",
        icon: <BookOpenText className="w-12 h-12 text-blue-400" />,
        buttonText: "Nueva Clase",
        buttonRoute: "/new-class",
      },
      proyectos: {
        title: "Proyectos Realizados",
        titleGradient: "from-purple-700 via-violet-700 to-fuchsia-600",
        description:
          "Explora todos los proyectos desarrollados durante las clases.",
        icon: <FlaskConical className="w-12 h-12 text-purple-400" />,
        buttonText: "Nuevo Proyecto",
        buttonRoute: "/newproject",
      },
      galeria: {
        title: "Galería Multimedia",
        titleGradient: "from-pink-600 via-fuchsia-600 to-purple-700",
        description:
          "Disfruta de las imágenes y videos capturados de tus proyectos y clases.",
        icon: <ImageIcon className="w-12 h-12 text-pink-400" />,
        buttonText: "Ver Galería Completa",
        buttonRoute: "/gallery",
      },
    }[categoryName] || {
      title: "Categoría no encontrada",
      titleGradient: "from-gray-400 to-gray-500",
      description: "La sección que buscas no existe.",
      icon: <FileText className="w-12 h-12 text-gray-500" />,
    };

  return (
    <motion.div
      className="flex-1 p-10 bg-cover bg-center bg-fixed text-white min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundImage: "url('/bc.png')",
      }}
    >
      {/* 🔹 Estilos de degradado animado */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradientFlow 4s linear infinite;
        }
      `}</style>

      {/* 🔹 Encabezado */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="inline-flex items-center justify-center mb-4 p-4 rounded-full border border-white/50 bg-black/40 backdrop-blur-sm shadow-lg">
          {config.icon}
        </div>

        {/* Título animado con borde negro */}
        <h1
          className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${config.titleGradient} animate-gradient 
          drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]`}
        >
          {config.title}
        </h1>

        {/* Descripción con mismo degradado, negrita y borde */}
        <p
          className={`text-transparent bg-clip-text bg-gradient-to-r ${config.titleGradient} animate-gradient 
          max-w-2xl mx-auto text-lg text-center font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]`}
        >
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

      {/* 🔹 Contenido */}
      {loading ? (
        <p className="text-center text-gray-300 mt-20 text-lg">
          Cargando contenido...
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-300 mt-20 text-lg">
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
              {/* 🖼️ Imagen o 🎥 Video según categoría */}
              {categoryName === "proyectos" && item.imagen_portada && (
                <img
                  src={item.imagen_portada}
                  alt={item.titulo}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              {categoryName === "galeria" && (
                <>
                  {item.video_url ? (
                    <video
                      src={item.video_url}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                      muted
                      autoPlay
                      loop
                    />
                  ) : (
                    item.imagen_url && (
                      <img
                        src={item.imagen_url}
                        alt={item.descripcion || "Imagen"}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )
                  )}
                </>
              )}

              {/* Título con negrita + borde */}
              <h3 className="text-xl font-bold text-white mb-2 drop-shadow-[0_2px_3px_rgba(0,0,0,1)]">
                {item.titulo ||
                  item.proyecto_titulo ||
                  (item.video_url ? "Video" : "Sin título")}
              </h3>

              {/* Descripción */}
              <p className="text-gray-200 mb-3 line-clamp-3 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {item.descripcion || "Sin descripción"}
              </p>

              {/* Fecha */}
              {(item.fecha || item.fecha_inicio) && (
                <div className="flex flex-wrap items-center text-sm text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(
                    item.fecha || item.fecha_inicio
                  ).toLocaleDateString("es-CL")}
                </div>
              )}

              {/* Proyecto vinculado (bitácora) */}
              {categoryName === "bitacora" &&
                (item.proyecto_titulo || item.proyecto_id) && (
                  <div className="flex items-center text-sm text-pink-200 italic mt-1">
                    <Layers className="w-4 h-4 mr-2 text-pink-300" />
                    Vinculado a:{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.setItem("openProyectoId", item.proyecto_id);
                        localStorage.setItem("reloadProyectos", "true");
                        navigate("/category/proyectos");
                      }}
                      className="text-pink-100 hover:underline ml-1"
                    >
                      {item.proyecto_titulo || `Proyecto #${item.proyecto_id}`}
                    </button>
                  </div>
                )}

              {/* Estadísticas (proyectos) */}
              {categoryName === "proyectos" && (
                <div className="flex items-center text-sm text-gray-200 space-x-4 mt-2">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1 text-pink-300" />
                    <span>{item.clase_count || 0} clases</span>
                  </div>
                  <div className="flex items-center">
                    <Images className="w-4 h-4 mr-1 text-blue-300" />
                    <span>
                      {(item.imagen_count || 0) + (item.video_count || 0)}{" "}
                      multimedia
                    </span>
                  </div>
                </div>
              )}
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
