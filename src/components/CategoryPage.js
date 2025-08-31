import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BookOpenText, FlaskConical, Image } from 'lucide-react';

const CategoryPage = ({ classes }) => {
  const { categoryName } = useParams();

  const getCategoryTitle = (name) => {
    switch (name) {
      case 'bitacora': return 'Bitácora de Clases';
      case 'experimentos': return 'Experimentos Realizados';
      case 'galeria': return 'Galería de Imágenes';
      default: return 'Categoría Desconocida';
    }
  };

  const getCategoryIcon = (name) => {
    switch (name) {
      case 'bitacora': return <BookOpenText className="w-16 h-16 text-blue-500" />;
      case 'experimentos': return <FlaskConical className="w-16 h-16 text-purple-500" />;
      case 'galeria': return <Image className="w-16 h-16 text-pink-500" />;
      default: return <BookOpen className="w-16 h-16 text-gray-500" />;
    }
  };

  const getCategoryDescription = (name) => {
    switch (name) {
      case 'bitacora': return 'Aquí encontrarás todos los apuntes y notas detalladas de cada una de tus clases. ¡El conocimiento al alcance de tu mano!';
      case 'experimentos': return 'Explora los resultados y detalles de los experimentos realizados en cada clase. ¡La ciencia en acción!';
      case 'galeria': return 'Un espacio visual para todas las imágenes, diagramas y fotos capturadas durante tus clases. ¡Porque una imagen vale más que mil palabras!';
      default: return 'Esta categoría no existe o es un misterio. ¿Te has perdido?';
    }
  };

  const getCategoryColor = (name) => {
    switch (name) {
      case 'bitacora': return { from: '#3B82F6', to: '#06B6D4' }; // blue-600 to cyan-700
      case 'experimentos': return { from: '#9333EA', to: '#6D28D9' }; // purple-600 to indigo-700
      case 'galeria': return { from: '#EC4899', to: '#BE185D' }; // pink-600 to red-700
      default: return { from: '#4B5563', to: '#374151' }; // gray-600 to gray-700
    }
  };

  const colors = getCategoryColor(categoryName);

  return (
    <motion.div
      className="flex-1 p-10 bg-gray-50 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className={`p-4 rounded-full`} style={{ background: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          {getCategoryIcon(categoryName)}
        </div>
      </motion.div>

      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-4 text-center bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(to right, ${colors.from}, ${colors.to})` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {getCategoryTitle(categoryName)}
      </motion.h1>
      <motion.p
        className="text-gray-600 text-lg mb-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {getCategoryDescription(categoryName)}
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ translateY: -5 }}
            >
              <Link to={`/class/${cls.id}/${categoryName}`} className="block">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">{cls.name}</h3>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{cls.description}</p>
                <div className="text-sm text-gray-500">
                  {cls.sections[categoryName] ? cls.sections[categoryName].length : 0} {categoryName === 'bitacora' ? 'apuntes' : categoryName === 'experimentos' ? 'experimentos' : 'imágenes'}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {classes.length === 0 && (
        <motion.div
          className="text-center text-gray-500 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-xl">Aún no hay clases para mostrar en esta categoría. ¡Es hora de crear una!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CategoryPage;