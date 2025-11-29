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
  PlayCircle,
  SortAsc,
  SortDesc,
  Folder,
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

  // orden asc / desc por fecha
  const [sortOrder, setSortOrder] = useState("desc");

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortItemsByDate = (data, order) => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      const dateA = new Date(a.fecha || a.fecha_inicio || 0);
      const dateB = new Date(b.fecha || b.fecha_inicio || 0);
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  };

  // cargar datos
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
      const sortedData =
        categoryName === "galeria"
          ? data // en galería el orden lo vamos a manejar por álbumes
          : sortItemsByDate(data, sortOrder);
      setItems(sortedData);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryName, sortOrder]);

  // recarga por localStorage
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

  // apertura automática de modales
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

  // 🔸 CONFIG CABECERA
  const config =
    {
      bitacora: {
        title: "Bitácora de Clases",
        description:
          "Aquí encontrarás el registro completo de todas las clases realizadas.",
        icon: <BookOpenText className="w-12 h-12 text-blue-500" />,
        buttonText: "Nueva Clase",
        buttonRoute: "/new-class",
      },
      proyectos: {
        title: "Proyectos Realizados",
        description:
          "Explora todos los proyectos desarrollados durante las clases.",
        icon: <FlaskConical className="w-12 h-12 text-purple-500" />,
        buttonText: "Nuevo Proyecto",
        buttonRoute: "/newproject",
      },
      galeria: {
        title: "Galería Multimedia",
        description:
          "Aquí verás álbumes por clase y proyecto con todas sus imágenes y videos vinculados.",
        icon: <ImageIcon className="w-12 h-12 text-pink-500" />,
        buttonText: "Ver Galería Completa",
        buttonRoute: "/gallery",
      },
    }[categoryName] || {
      title: "Categoría no encontrada",
      description: "La sección que buscas no existe.",
      icon: <FileText className="w-12 h-12 text-gray-500" />,
    };

  // 🔸 AGRUPAR GALERÍA EN "CARPETAS" (álbumes)
  const galleryAlbums =
    categoryName === "galeria"
      ? (() => {
          const map = new Map();

          items.forEach((media) => {
            let key, label, tipo, targetId;

            if (media.proyecto_id) {
              key = `proyecto-${media.proyecto_id}`;
              label =
                media.proyecto_titulo || `Proyecto #${media.proyecto_id}`;
              tipo = "proyecto";
              targetId = media.proyecto_id;
            } else if (media.clase_id) {
              key = `clase-${media.clase_id}`;
              label = media.clase_titulo || `Clase #${media.clase_id}`;
              tipo = "clase";
              targetId = media.clase_id;
            } else {
              key = "otros-0";
              label = "Multimedia sin vincular";
              tipo = "otros";
              targetId = null;
            }

            if (!map.has(key)) {
              map.set(key, {
                key,
                label,
                tipo,
                targetId,
                coverImage: media.imagen_url || null,
                total: 0,
                images: 0,
                videos: 0,
              });
            }

            const album = map.get(key);
            album.total += 1;
            if (media.tipo === "video") album.videos += 1;
            else album.images += 1;

            if (!album.coverImage && media.imagen_url) {
              album.coverImage = media.imagen_url;
            }
          });

          return Array.from(map.values());
        })()
      : [];

  // abrir álbum de galería → ir a la clase/proyecto y mostrar su libro
  const handleOpenGalleryAlbum = (album) => {
    if (album.tipo === "proyecto" && album.targetId) {
      localStorage.setItem("openProyectoId", album.targetId);
      localStorage.setItem("reloadProyectos", "true");
      navigate("/category/proyectos");
    } else if (album.tipo === "clase" && album.targetId) {
      localStorage.setItem("openClaseId", album.targetId);
      localStorage.setItem("reloadBitacora", "true");
      navigate("/category/bitacora");
    } else {
      // multimedia sin vincular: abre simplemente el primer elemento
      const first = items.find(
        (m) => !m.proyecto_id && !m.clase_id
      );
      if (first) {
        handleOpenDetail(first, "galeria");
      }
    }
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
      {/* estilos de gradiente */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientFlow 6s ease infinite;
        }
      `}</style>

      {/* encabezado */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="inline-flex items-center justify-center mb-4 p-4 rounded-full border border-white/50 bg-black/40 backdrop-blur-sm shadow-lg">
          {config.icon}
        </div>

        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-500 animate-gradient mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          {config.title}
        </h1>

        <p className="text-gray-200 max-w-2xl mx-auto text-lg drop-shadow-sm">
          {config.description}
        </p>
      </motion.div>

      {/* botones */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {isAdmin() && categoryName !== "galeria" && (
          <motion.button
            onClick={() => navigate(config.buttonRoute)}
            className="flex items-center px-6 py-3 rounded-xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle className="w-5 h-5 mr-2 text-pink-300" />
            {config.buttonText}
          </motion.button>
        )}

        {categoryName !== "galeria" && (
          <motion.button
            onClick={toggleSortOrder}
            className="flex items-center px-6 py-3 rounded-xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sortOrder === "asc" ? (
              <>
                <SortAsc className="w-5 h-5 mr-2 text-green-300" /> Ordenar ↑
              </>
            ) : (
              <>
                <SortDesc className="w-5 h-5 mr-2 text-blue-300" /> Ordenar ↓
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* contenido */}
      {loading ? (
        <p className="text-center text-gray-300 mt-20 text-lg">
          Cargando contenido...
        </p>
      ) : categoryName === "galeria" ? (
        // 🔸 VISTA DE ÁLBUMES DE GALERÍA
        galleryAlbums.length === 0 ? (
          <p className="text-center text-gray-300 mt-20 text-lg">
            No hay imágenes ni videos en la galería.
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
            {galleryAlbums.map((album) => (
              <motion.div
                key={album.key}
                className="p-6 rounded-2xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all cursor-pointer flex flex-col justify-between"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleOpenGalleryAlbum(album)}
              >
                <div>
                  <div className="flex items-center mb-2">
                    <Folder className="w-5 h-5 text-yellow-300 mr-2" />
                    <h3 className="text-xl font-semibold text-white">
                      {album.label}
                    </h3>
                  </div>

                  <p className="text-gray-200 text-sm mb-3">
                    {album.images} imágenes
                    {album.videos > 0 && ` · ${album.videos} videos`}
                  </p>

                  {album.tipo === "proyecto" && (
                    <div className="flex items-center text-xs text-purple-200 mb-2">
                      <FlaskConical className="w-4 h-4 mr-1 text-purple-300" />
                      Proyecto
                    </div>
                  )}
                  {album.tipo === "clase" && (
                    <div className="flex items-center text-xs text-blue-200 mb-2">
                      <BookOpen className="w-4 h-4 mr-1 text-blue-300" />
                      Clase / Bitácora
                    </div>
                  )}
                </div>

                {album.coverImage && (
                  <div className="mt-4">
                    <img
                      src={album.coverImage}
                      alt={album.label}
                      className="w-full h-32 object-cover rounded-xl border border-white/20 shadow-md"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )
      ) : items.length === 0 ? (
        <p className="text-center text-gray-300 mt-20 text-lg">
          No hay registros en esta categoría.
        </p>
      ) : (
        // 🔸 TARJETAS NORMALES (BITÁCORA / PROYECTOS)
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
              className="p-6 rounded-2xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all cursor-pointer flex flex-col justify-between"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleOpenDetail(item)}
            >
              <div>
                {/* título */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.titulo ||
                    item.proyecto_titulo ||
                    "Sin título"}
                </h3>

                {/* descripción */}
                <p className="text-gray-200 mb-3 line-clamp-3">
                  {item.descripcion || "Sin descripción"}
                </p>

                {/* fecha */}
                {(item.fecha || item.fecha_inicio) && (
                  <div className="flex items-center text-sm text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(
                      item.fecha || item.fecha_inicio
                    ).toLocaleDateString("es-CL")}
                  </div>
                )}

                {/* proyecto vinculado (bitácora) */}
                {categoryName === "bitacora" &&
                  (item.proyecto_titulo || item.proyecto_id) && (
                    <div className="flex items-center text-sm text-pink-200 italic">
                      <Layers className="w-4 h-4 mr-2 text-pink-300" />
                      Vinculado a:{" "}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem(
                            "openProyectoId",
                            item.proyecto_id
                          );
                          localStorage.setItem("reloadProyectos", "true");
                          navigate("/category/proyectos");
                        }}
                        className="text-pink-100 hover:underline ml-1"
                      >
                        {item.proyecto_titulo ||
                          `Proyecto #${item.proyecto_id}`}
                      </button>
                    </div>
                  )}

                {/* estadísticas (proyectos) */}
                {categoryName === "proyectos" && (
                  <div className="flex items-center text-sm text-gray-200 space-x-4 mt-2">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1 text-blue-300" />
                      <span>{item.clase_count || 0} clases</span>
                    </div>
                    <div className="flex items-center">
                      <Images className="w-4 h-4 mr-1 text-pink-300" />
                      <span>
                        {(item.imagen_count || 0) +
                          (item.video_count || 0)}{" "}
                        multimedia
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* mini banner de portada abajo */}
              {(categoryName === "bitacora" ||
                categoryName === "proyectos") &&
                item.imagen_portada && (
                  <div className="mt-4">
                    <img
                      src={item.imagen_portada}
                      alt={item.titulo || "Portada"}
                      className="w-full max-h-48 object-contain rounded-xl border border-white/20 shadow-md bg-black/40"
                    />
                  </div>
                )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* modal libro */}
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
