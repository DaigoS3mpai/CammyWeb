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
  BookOpen,
  Layers,
  Images,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Al montar o cambiar categoría
  useEffect(() => {
    fetchData();
  }, [categoryName]);

  // 🔁 Recarga automática tras creación
  useEffect(() => {
    const reloadFlags = {
      bitacora: "reloadBitacora",
      proyectos: "reloadProyectos",
      galeria: "reloadGaleria",
    };
    const key = reloadFlags[categoryName];
    if (key && localStorage.getItem(key) === "true") {
      fetchData();
      localStorage.removeItem(key);
    }
  }, [categoryName]);

  // 🔹 Config visual
  const config = {
    bitacora: {
      title: "Bitácora de Clases",
      description:
        "Aquí encontrarás el registro completo de todas las clases realizadas.",
      icon: <BookOpenText className="w-12 h-12 text-blue-500" />,
      gradient: "from-blue-500 to-cyan-600",
      buttonText: "Nueva Clase",
      buttonRoute: "/new-class",
    },
    proyectos: {
      title: "Proyectos Realizados",
      description:
        "Explora todos los proyectos desarrollados durante las clases.",
      icon: <FlaskConical className="w-12 h-12 text-purple-500" />,
      gradient: "from-purple-500 to-indigo-600",
      buttonText: "Nuevo Proyecto",
      buttonRoute: "/newproject",
    },
    galeria: {
      title: "Galería de Imágenes",
      description:
        "Disfruta de todas las imágenes capturadas de tus proyectos y clases.",
      icon: <ImageIcon className="w-12 h-12 text-pink-500" />,
      gradient: "from-pink-500 to-rose-600",
      buttonText: "Ver Galería Completa",
      buttonRoute: "/gallery",
    },
  }[categoryName] || {
    title: "Categoría no encontrada",
    description: "La sección que buscas no existe.",
    icon: <FileText className="w-12 h-12 text-gray-500" />,
    gradient: "from-gray-400 to-gray-600",
  };

  return (
    <motion.div
      className="flex-1 p-10 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🔹 Encabezado */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div
          className={`inline-flex items-center justify-center mb-4 p-4 rounded-full bg-gradient-to-br ${config.gradient} text-white shadow-md`}
        >
          {config.icon}
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
          {config.title}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          {config.description}
        </p>
      </motion.div>

      {/* 🔹 Botón admin */}
      {isAdmin() && categoryName !== "galeria" && (
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => navigate(config.buttonRoute)}
            className={`flex items-center px-6 py-3 text-white rounded-xl font-semibold shadow-lg bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {config.buttonText}
          </motion.button>
        </div>
      )}

      {/* 🔹 Contenido */}
      {loading ? (
        <p className="text-center text-gray-500 mt-20 text-lg">
          Cargando contenido...
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 mt-20 text-lg">
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
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              {/* Imagen portada */}
              {categoryName === "galeria" && item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.descripcion || "Imagen"}
                  className="w-full h-64 object-cover"
                />
              ) : categoryName === "proyectos" && item.imagen_portada ? (
                <img
                  src={item.imagen_portada}
                  alt={item.titulo}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-200" />
              )}

              {/* Texto */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.titulo || item.proyecto_titulo || "Sin título"}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-3">
                  {item.descripcion || "Sin descripción"}
                </p>

                {/* 🔹 Fecha */}
                {item.fecha || item.fecha_inicio ? (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(item.fecha || item.fecha_inicio).toLocaleDateString(
                      "es-CL"
                    )}
                  </div>
                ) : null}

                {/* 🔹 Estadísticas para proyectos */}
                {categoryName === "proyectos" && (
                  <div className="flex items-center text-sm text-gray-600 space-x-4 mt-2">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1 text-blue-500" />
                      <span>{item.clase_count || 0} clases</span>
                    </div>
                    <div className="flex items-center">
                      <Images className="w-4 h-4 mr-1 text-pink-500" />
                      <span>{item.imagen_count || 0} imágenes</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CategoryPage;
