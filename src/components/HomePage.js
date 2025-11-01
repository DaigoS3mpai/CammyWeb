import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const HomePage = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <motion.div
      className="flex-1 p-10 flex flex-col items-center justify-center text-center relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/1451763983/es/foto/fondo-de-textura-de-papel-blanco.jpg?s=612x612&w=0&k=20&c=DKziAxjjLEt5ChPqT5pmpL13Q1FVl6tGB7n7x16xorY=')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Capas translúcidas para contraste */}
      <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-md"></div>

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          className="text-6xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow-md"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Bienvenido a{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-700">
            CammyWeb
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-800 mb-10 max-w-3xl leading-relaxed bg-white bg-opacity-60 p-6 rounded-3xl shadow-lg border border-pink-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Hola, soy{' '}
          <span className="font-semibold text-purple-700">Camila Aguierre</span>, estudiante de
          <span className="italic"> Pedagogía en Educación Básica </span> de la Universidad de Chile.  
          Este es mi proyecto para la asignatura{' '}
          <span className="italic">Proyecto Tecnológico</span>, donde compartiré mis clases y los proyectos
          que realizaremos en conjunto con mis compañeros, dándoles un enfoque{' '}
          <span className="font-bold text-pink-500">pedagógico y didáctico</span> para fomentar la enseñanza
          y aprendizaje de nuestros futuros estudiantes. 🌸✨
        </motion.p>

        {/* Opciones */}
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
          {isAuthenticated() && (
            <Link
              to="/category/bitacora"
              className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-blue-200 bg-white bg-opacity-70 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <Eye className="w-12 h-12 text-blue-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Visualizar Apuntes</h3>
              <p className="text-gray-600 text-sm mt-1">
                Explora el conocimiento existente 📖✨.
              </p>
            </Link>
          )}

          {isAdmin() && (
            <Link
              to="/new-class"
              className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-green-200 bg-white bg-opacity-70 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <UploadCloud className="w-12 h-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Subir Contenidos</h3>
              <p className="text-gray-600 text-sm mt-1">
                Añade nuevas clases y apuntes 📚💡.
              </p>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
