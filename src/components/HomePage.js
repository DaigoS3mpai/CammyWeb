import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Eye, BookOpenText, FlaskConical, Image } from 'lucide-react';
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
        backgroundImage: "url('/bc.jfif')", // 🖼️ tu imagen en /public/bc.jfif
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ✅ capa translúcida para legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-[2px]"></div>

      {/* contenido principal */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          className="text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Bienvenido a{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 drop-shadow-lg">
            CammyWeb
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white mb-10 max-w-3xl leading-relaxed bg-white bg-opacity-20 p-6 rounded-3xl shadow-lg backdrop-blur-sm border border-white/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Hola, soy{' '}
          <span className="font-semibold text-pink-300">Camila Aguierre</span>, estudiante de
          <span className="italic"> Pedagogía en Educación Básica </span> de la Universidad de Chile.  
          Este es mi proyecto para la asignatura{' '}
          <span className="italic">Proyecto Tecnológico</span>, donde compartiré mis clases y los proyectos
          que realizaremos en conjunto con mis compañeros, dándoles un enfoque{' '}
          <span className="font-bold text-pink-400">pedagógico y didáctico</span> para fomentar la enseñanza
          y aprendizaje de nuestros futuros estudiantes. 🌸✨
        </motion.p>

        {/* opciones dinámicas */}
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8">
          {isAuthenticated() && (
            <>
              <Link
                to="/category/bitacora"
                className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-blue-300 bg-white bg-opacity-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <Eye className="w-12 h-12 text-blue-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Visualizar Apuntes</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Explora el conocimiento existente 📖✨.
                </p>
              </Link>

              {isAdmin() && (
                <Link
                  to="/new-class"
                  className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-green-300 bg-white bg-opacity-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <UploadCloud className="w-12 h-12 text-green-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">Subir Contenidos</h3>
                  <p className="text-gray-700 text-sm mt-1">
                    Añade nuevas clases y apuntes 📚💡.
                  </p>
                </Link>
              )}
            </>
          )}

          {!isAuthenticated() && (
            <>
              <Link
                to="/category/bitacora"
                className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-blue-300 bg-white bg-opacity-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <BookOpenText className="w-12 h-12 text-blue-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Bitácora</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Explora reflexiones y experiencias 📖✨.
                </p>
              </Link>

              <Link
                to="/category/proyectos"
                className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-purple-300 bg-white bg-opacity-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <FlaskConical className="w-12 h-12 text-purple-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Proyectos</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Mira los trabajos y actividades 🧩.
                </p>
              </Link>

              <Link
                to="/category/galeria"
                className="flex flex-col items-center p-6 rounded-3xl shadow-xl border border-pink-300 bg-white bg-opacity-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <Image className="w-12 h-12 text-pink-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Galería</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Descubre momentos y fotografías 📸.
                </p>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
