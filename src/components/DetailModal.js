import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Save, FileText, Calendar, Tag, FlaskConical, Image, Info } from 'lucide-react';
import { useAuth } from './AuthContext';

const DetailModal = ({ item, type, onClose, onSave }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedItem, type);
    setIsEditing(false);
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Cierra al hacer clic fuera del modal
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal cierre el modal
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex items-center mb-6">
            {type === 'bitacora' && <FileText className="w-8 h-8 text-blue-600 mr-3" />}
            {type === 'experimentos' && <FlaskConical className="w-8 h-8 text-purple-600 mr-3" />}
            {type === 'galeria' && <Image className="w-8 h-8 text-pink-600 mr-3" />}
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedItem.title}
                onChange={handleInputChange}
                className="text-3xl font-bold text-gray-900 w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900">{item.title}</h2>
            )}
          </div>

          {type === 'galeria' && (
            <div className="mb-6">
              <img src={item.url} alt={item.title} className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md" />
            </div>
          )}

          <div className="mb-6 text-gray-700 space-y-4">
            <div>
              <p className="font-semibold flex items-center text-lg mb-2">
                <Info className="w-5 h-5 mr-2 text-gray-500" /> Descripción:
              </p>
              {isEditing ? (
                <textarea
                  name={type === 'galeria' ? 'description' : 'content'}
                  value={type === 'galeria' ? editedItem.description : editedItem.content}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                />
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap">{item.content || item.description}</p>
              )}
            </div>

            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-semibold">Fecha:</span> {item.date}
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center text-gray-600">
                <Tag className="w-5 h-5 mr-2" />
                <span className="font-semibold">Etiquetas:</span> {item.tags.join(', ')}
              </div>
            )}

            {type === 'experimentos' && item.materials && item.materials.length > 0 && (
              <div className="text-gray-600">
                <p className="font-semibold flex items-center text-lg mb-2">
                  <FlaskConical className="w-5 h-5 mr-2 text-gray-500" /> Materiales:
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="materials"
                    value={editedItem.materials.join(', ')}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, materials: e.target.value.split(',').map(m => m.trim()) }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p>{item.materials.join(', ')}</p>
                )}
              </div>
            )}
          </div>

          {isAdmin() && (
            <div className="flex justify-end mt-6 space-x-4">
              {isEditing ? (
                <motion.button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-5 h-5 mr-2" /> Guardar
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-5 h-5 mr-2" /> Editar
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailModal;