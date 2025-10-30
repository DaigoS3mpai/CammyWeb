import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  BookOpenText,
  FlaskConical,
  Image as ImageIcon,
  PlusCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎯 Configuración de color y estilo
  const categoryData = {
    bitacora: {
      title: "Bitácora de Clases",
      desc: "Aquí encontrarás los apuntes y detalles de cada clase.",
      icon: <BookOpenText className="w-16 h-16 text-blue-500" />,
      gradient: "from-blue-600 to-cyan-700",
      api: "/.netlify/functions/getClases",
      buttonText: "Crear Nueva Clase",
      route: "/new-class",
    },
    proyectos: {
      title: "Proyectos Realizados",
      desc: "Explora los resultados y avances de los proyectos creados.",
      icon: <FlaskConical className="w-16 h-16 text-purple-500" />,
      gradient: "from-purple-600 to-indigo-700",
      api: "/.netlify/functions/getProyectos",
      buttonText: "Crear Proyecto",
      route: "/newproject",
    },
    galeria: {
      title: "Galería de Imágenes",
      desc: "Un espacio visual con las fotos y registros de tus clases y proyectos.",
      icon: <ImageIcon className="w-16 h-16 text-pink-500" />,
      gradient: "from-pink-600 to-red-700",
      api: "/.netlify/functions/getGaleria",
    },
  };

  const category = categoryData[categoryName];

  useEffect(() => {
    const fetchData = async () => {
      if (!category) return;
      setLoading(true);

      try {
        const res = await fetch(category.api);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName]);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <BookOpen className="w-12 h-12 mb-4" />
        <p className="text-xl">Categoría no encontrada</p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 p-10 bg-gray-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🔹 Encabezado */}
      <motion.div
        className="flex flex-col items-center text-center mb-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div
          className={`p-4 rounded-full bg-gradient-to-br ${category.gradient} shadow-lg`}
        >
          {category.icon}
        </div>

        <h1
          className={`text-5xl font-extrabold mt-6 bg-clip-text text-transparent bg-gradient-to-r ${category.gradient}`}
        >
          {category.title}
        </h1>
        <p className="text-gray-600 text-lg mt-3 max-w-2xl">
          {category.desc}
        </p>
      </motion.div>

      {/* 🔹 Botón de creación (solo admin) */}
      {isAdmin() && category.route && (
        <div className="flex justify-center mb-10">
          <motion.button
            className={`px-6 py-3 rounded-xl text-white font-semibold shadow-md flex items-center gap-2 bg-gradient-to-r ${category.gradient} hover:opacity-90 transition`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(category.route)}
          >
            <PlusCircle className="w-5 h-5" />
            {category.buttonText}
          </motion.button>
        </div>
      )}

      {/* 🔹 Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Cargando...</p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-10">
          No hay registros todavía. ¡Crea el primero! ✨
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {/* Vista según categoría */}
                {categoryName === "proyectos" ? (
                  <>
                    {item.imagen_portada && (
                      <img
                        src={item.imagen_portada}
                        alt={item.titulo}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {item.titulo}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {item.descripcion || "Sin descripción"}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(item.fecha_inicio).toLocaleDateString("es-CL")}
                    </div>

                    {/* Mini galería */}
                    {item.imagenes?.length > 0 && (
                      <div className="flex gap-2">
                        {item.imagenes.slice(0, 3).map((img) => (
                          <img
                            key={img.id}
                            src={img.imagen_url}
                            alt={img.descripcion || "Imagen"}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        ))}
                        {item.imagenes.length > 3 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-semibold">
                            +{item.imagenes.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : categoryName === "bitacora" ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {item.titulo}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {item.descripcion || "Sin descripción"}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(item.fecha).toLocaleDateString("es-CL")}
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={item.imagen_url}
                      alt={item.descripcion}
                      className="w-full h-64 object-cover rounded-xl mb-3"
                    />
                    <p className="text-gray-700 text-center">
                      {item.descripcion || "Sin descripción"}
                    </p>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      {item.proyecto_titulo || "Sin proyecto asociado"}
                    </p>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPage;
