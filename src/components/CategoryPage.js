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

  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedAlbum, setExpandedAlbum] = useState(null); // álbum abierto en galería

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
        categoryName === "galeria" ? data : sortItemsByDate(data, sortOrder);
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

  // CONFIG CABECERA
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
          "Álbumes por clase y proyecto. Abre una carpeta y explora todas sus imágenes y videos.",
        icon: <ImageIcon className="w-12 h-12 text-pink-500" />,
        buttonText: "Ver Galería Completa",
        buttonRoute: "/gallery",
      },
    }[categoryName] || {
      title: "Categoría no encontrada",
      description: "La sección que buscas no existe.",
      icon: <FileText className="w-12 h-12 text-gray-500" />,
    };

  // AGRUPAR GALERÍA EN "CARPETAS" (álbumes)
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

  // obtener media para un álbum concreto
  const getMediaForAlbum = (album) => {
    if (album.tipo === "proyecto" && album.targetId) {
      return items.filter((m) => m.proyecto_id === album.targetId);
    }
    if (album.tipo === "clase" && album.targetId) {
      return items.filter((m) => m.clase_id === album.targetId);
    }
    // sin vincular
    return items.filter((m) => !m.proyecto_id && !m.clase_id);
  };

  const toggleAlbum = (albumKey) => {
    setExpandedAlbum((prev) => (prev === albumKey ? null : albumKey));
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
        // VISTA ÁLBUMES GALERÍA
        galleryAlbums.length === 0 ? (
          <p className="text-center text-gray-300 mt-20 text-lg">
            No hay imágenes ni videos en la galería.
          </p>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {galleryAlbums.map((album) => {
              const isOpen = expandedAlbum === album.key;
              const mediaForAlbum = isOpen ? getMediaForAlbum(album) : [];

              return (
                <motion.div
                  key={album.key}
                  className="rounded-2xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg overflow-hidden"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  {/* cabecera Álbum */}
                  <button
                    type="button"
                    onClick={() => toggleAlbum(album.key)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-black/60 transition-all"
                  >
                    <div className="flex items-center">
                      <Folder className="w-5 h-5 text-yellow-300 mr-2" />
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-white">
                          {album.label}
                        </h3>
                        <p className="text-gray-200 text-sm">
                          {album.images} imágenes
                          {album.videos > 0 && ` · ${album.videos} videos`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-200">
                      {isOpen ? "Cerrar" : "Abrir"}
                    </span>
                  </button>

                  {/* preview portada cuando está cerrado */}
                  {album.coverImage && !isOpen && (
                    <div className="px-6 pb-4">
                      <div className="w-full h-32 bg-black/40 rounded-xl border border-white/20 shadow-md flex items-center justify-center overflow-hidden">
                        <img
                          src={album.coverImage}
                          alt={album.label}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* contenido expandido: miniaturas */}
                  {isOpen && (
                    <div className="px-6 pb-4">
                      {mediaForAlbum.length === 0 ? (
                        <p className="text-gray-200 text-sm mt-2">
                          No hay archivos en este álbum.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                          {mediaForAlbum.map((media) =>
                            media.tipo === "video" ? (
                              <motion.div
                                key={media.id}
                                className="relative rounded-lg overflow-hidden border border-white/25 cursor-pointer bg-black/40 flex items-center justify-center h-32"
                                whileHover={{ scale: 1.03 }}
                                onClick={() =>
                                  handleOpenDetail(media, "galeria")
                                }
                              >
                                <video
                                  src={media.imagen_url}
                                  className="max-h-full max-w-full object-contain"
                                  muted
                                  playsInline
                                  loop
                                />
                                <PlayCircle className="absolute top-2 left-2 w-6 h-6 text-white drop-shadow-md" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key={media.id}
                                className="rounded-lg overflow-hidden border border-white/25 cursor-pointer bg-black/40 flex items-center justify-center h-32"
                                whileHover={{ scale: 1.03 }}
                                onClick={() =>
                                  handleOpenDetail(media, "galeria")
                                }
                              >
                                <img
                                  src={media.imagen_url}
                                  alt={media.descripcion || "Imagen"}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </motion.div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : items.length === 0 ? (
        <p className="text-center text-gray-300 mt-20 text-lg">
          No hay registros en esta categoría.
        </p>
      ) : (
        // TARJETAS NORMALES (BITÁCORA / PROYECTOS)
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.titulo || item.proyecto_titulo || "Sin título"}
                </h3>

                <p className="text-gray-200 mb-3 line-clamp-3">
                  {item.descripcion || "Sin descripción"}
                </p>

                {(item.fecha || item.fecha_inicio) && (
                  <div className="flex items-center text-sm text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(
                      item.fecha || item.fecha_inicio
                    ).toLocaleDateString("es-CL")}
                  </div>
                )}

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
