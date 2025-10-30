import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Tag,
  Edit,
  Trash2,
  PlusCircle,
  FlaskConical,
  BookOpenText,
  Image
} from 'lucide-react';
import { useAuth } from './AuthContext';
import DetailModal from './DetailModal';

const ClassContent = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // 🔹 Estado para datos y UI
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [activeTab, setActiveTab] = useState('bitacora');

  // 🔹 Cargar clases reales desde Neon vía Netlify
  useEffect(() => {
    fetch('/.netlify/functions/getClases')
      .then((res) => res.json())
      .then((data) => {
        setClases(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar clases:', err);
        setLoading(false);
      });
  }, []);

  const currentClass = clases.find((c) => c.id.toString() === classId);

  if (loading) {
    return (
      <motion.div
        className="flex-1 p-10 bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg text-gray-500">Cargando clases...</p>
      </motion.div>
    );
  }

  if (!currentClass) {
    return (
      <motion.div
        className="flex-1 p-10 bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-gray-600">
          <h2 className="text-3xl font-bold mb-4">Clase no encontrada</h2>
          <p className="text-lg">
            Parece que esta clase se ha ido de vacaciones. Intenta con otra.
          </p>
        </div>
      </motion.div>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/class/${classId}/${tab}`);
  };

  const openDetailModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setModalType('');
  };

  const handleSaveItem = (updatedItem, type) => {
    setClases((prev) =>
      prev.map((cls) =>
        cls.id === updatedItem.id ? { ...cls, ...updatedItem } : cls
      )
    );
  };

  return (
    <motion.div
      className="flex-1 p-10 bg-gray-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* 🔹 Encabezado de clase */}
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {currentClass.titulo}
      </motion.h1>
      <motion.p
        className="text-gray-600 text-lg mb-8 max-w-2xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {currentClass.descripcion}
      </motion.p>

      {/* 🔹 Tabs */}
      <div className="flex mb-8 space-x-4">
        <motion.button
          onClick={() => handleTabChange('bitacora')}
          className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center ${
            activeTab === 'bitacora'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BookOpenText className="w-5 h-5 mr-2" />
          Bitácora
        </motion.button>

        <motion.button
          onClick={() => handleTabChange('experimentos')}
          className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center ${
            activeTab === 'experimentos'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FlaskConical className="w-5 h-5 mr-2" />
          Experimentos
        </motion.button>

        <motion.button
          onClick={() => handleTabChange('galeria')}
          className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center ${
            activeTab === 'galeria'
              ? 'bg-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image className="w-5 h-5 mr-2" />
          Galería
        </motion.button>
      </div>

      {/* 🔹 Botón para añadir nuevo contenido */}
      {isAdmin() && (
        <motion.button
          className="mb-8 px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all duration-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            alert(
              `Aquí iría el formulario para añadir un nuevo ${
                activeTab === 'bitacora'
                  ? 'apunte'
                  : activeTab === 'experimentos'
                  ? 'experimento'
                  : 'elemento a la galería'
              }`
            )
          }
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Añadir Nuevo{' '}
          {activeTab === 'bitacora'
            ? 'Apunte'
            : activeTab === 'experimentos'
            ? 'Experimento'
            : 'Elemento'}
        </motion.button>
      )}

      {/* 🔹 Contenido de clases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {clases.length > 0 ? (
            clases.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 relative group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ translateY: -5 }}
                onClick={() => openDetailModal(item, activeTab)}
              >
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-blue-500 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.titulo}
                  </h3>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {item.descripcion}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(item.fecha).toLocaleDateString('es-CL')}
                  </span>
                  <Tag className="w-4 h-4 ml-4 mr-2" />
                  <span className="italic">
                    {item.proyecto_titulo || 'Sin proyecto'}
                  </span>
                </div>

                {isAdmin() && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Editando: ${item.titulo}`);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Eliminando: ${item.titulo}`);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center text-gray-500 mt-16 col-span-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="text-xl">
                Aún no hay clases registradas. ¡Es hora de empezar a crear!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          type={modalType}
          onClose={closeDetailModal}
          onSave={handleSaveItem}
        />
      )}
    </motion.div>
  );
};

export default ClassContent;
