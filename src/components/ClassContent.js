import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Tag, Edit, Trash2, PlusCircle, FlaskConical, BookOpenText, Image } from 'lucide-react';
import { useAuth } from './AuthContext';
import DetailModal from './DetailModal'; // Importar el nuevo componente

const ClassContent = ({ classes, setClasses }) => { // Recibir setClasses
  const { classId } = useParams();
  const navigate = useNavigate();
  const currentClass = classes.find(cls => cls.id === classId);
  const { isAdmin } = useAuth();
  
  const pathParts = window.location.pathname.split('/');
  const defaultTab = pathParts[pathParts.length - 1];
  const [activeTab, setActiveTab] = useState(defaultTab === classId ? 'bitacora' : defaultTab);

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');

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
          <p className="text-lg">Parece que esta clase se ha ido de vacaciones. Intenta con otra.</p>
        </div>
      </motion.div>
    );
  }

  const currentContent = currentClass.sections[activeTab] || [];

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
    setClasses(prevClasses =>
      prevClasses.map(cls =>
        cls.id === classId
          ? {
              ...cls,
              sections: {
                ...cls.sections,
                [type]: cls.sections[type].map(item =>
                  item.id === updatedItem.id ? updatedItem : item
                )
              }
            }
          : cls
      )
    );
    setSelectedItem(updatedItem); // Actualiza el item en el modal
  };

  return (
    <motion.div
      className="flex-1 p-10 bg-gray-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {currentClass.name}
      </motion.h1>
      <motion.p
        className="text-gray-600 text-lg mb-8 max-w-2xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {currentClass.description}
      </motion.p>

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

      {isAdmin() && (
        <motion.button
          className="mb-8 px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all duration-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert(`¡Aquí podrías agregar un formulario para añadir un nuevo ${activeTab === 'bitacora' ? 'apunte' : activeTab === 'experimentos' ? 'experimento' : 'elemento a la galería'}!`)}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Añadir Nuevo {activeTab === 'bitacora' ? 'Apunte' : activeTab === 'experimentos' ? 'Experimento' : 'Elemento'}
        </motion.button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {currentContent.length > 0 ? (
            currentContent.map((item, index) => (
              <motion.div
                key={item.id || item.title + index}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 relative group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ translateY: -5 }}
                onClick={() => openDetailModal(item, activeTab)} // Abre el modal al hacer clic
              >
                {activeTab === 'galeria' && item.url ? (
                  <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                    <img src={item.url} alt={item.title} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-blue-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                  </div>
                )}
                
                <p className="text-gray-700 mb-4 line-clamp-3">{item.content || item.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{item.date}</span>
                  {item.tags && item.tags.length > 0 && (
                    <>
                      <Tag className="w-4 h-4 ml-4 mr-2" />
                      <span className="italic">{item.tags.join(', ')}</span>
                    </>
                  )}
                </div>
                {activeTab === 'experimentos' && item.materials && item.materials.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-semibold">Materiales:</span> {item.materials.join(', ')}
                  </div>
                )}
                {isAdmin() && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); alert(`Editando: ${item.title}`); }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); alert(`Eliminando: ${item.title}`); }}
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
              <p className="text-xl">Aún no hay {activeTab === 'bitacora' ? 'apuntes' : activeTab === 'experimentos' ? 'experimentos' : 'imágenes'} para esta clase. ¡Es hora de empezar a crear!</p>
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