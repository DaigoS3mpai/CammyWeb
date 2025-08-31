import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Calendar, Info, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import DetailModal from './DetailModal'; // Importar el nuevo componente

const GalleryPage = ({ classes, setClasses }) => { // Recibir setClasses
  const { classId } = useParams();
  const currentClass = classes.find(cls => cls.id === classId);
  const { isAdmin } = useAuth();

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

  const galleryItems = currentClass.sections.galeria || [];

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
        className="text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-red-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Galería de {currentClass.name}
      </motion.h1>
      <motion.p
        className="text-gray-600 text-lg mb-8 max-w-2xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Aquí encontrarás todas las imágenes y fotos relevantes de esta clase. ¡Una imagen vale más que mil palabras, o al menos más que mil ecuaciones!
      </motion.p>

      {isAdmin() && (
        <motion.button
          className="mb-8 px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all duration-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert(`¡Aquí podrías agregar un formulario para subir una nueva imagen a la galería de ${currentClass.name}!`)}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Subir Nueva Imagen
        </motion.button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {galleryItems.length > 0 ? (
            galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                onClick={() => openDetailModal(item, 'galeria')} // Abre el modal al hacer clic
              >
                <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img src={item.url} alt={item.title} className="object-cover w-full h-full" />
                  {isAdmin() && (
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); alert(`Editando imagen: ${item.title}`); }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); alert(`Eliminando imagen: ${item.title}`); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center text-gray-500 mt-16 col-span-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="text-xl">Aún no hay imágenes en la galería de esta clase. ¡Es hora de sacar la cámara!</p>
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

export default GalleryPage;