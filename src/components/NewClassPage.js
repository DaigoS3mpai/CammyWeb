import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewClassPage = ({ onAddClass }) => {
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (className.trim()) {
      const newClass = {
        id: className.toLowerCase().replace(/\s+/g, '-'), // Genera un ID simple
        name: className.trim(),
        description: classDescription.trim() || 'Una clase nueva y emocionante.',
        sections: { // Inicializa las nuevas secciones
          bitacora: [],
          proyectos: []
        }
      };
      onAddClass(newClass);
      navigate(`/class/${newClass.id}`); // Redirige a la nueva clase
    } else {
      alert('El nombre de la clase no puede estar vacío. ¡No seas tan misterioso!');
    }
  };

  return (
    <motion.div
      className="flex-1 p-10 bg-gradient-to-br from-blue-50 to-purple-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Crear Nueva Clase
      </motion.h1>

      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="className" className="block text-gray-700 text-lg font-semibold mb-2">
              Nombre de la Clase
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ej: Física Cuántica para Dummies"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="classDescription" className="block text-gray-700 text-lg font-semibold mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              id="classDescription"
              value={classDescription}
              onChange={(e) => setClassDescription(e.target.value)}
              placeholder="Una breve descripción de lo que se verá en esta clase..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg resize-y"
            ></textarea>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle className="w-6 h-6 mr-3" />
            Crear Clase
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NewClassPage;
