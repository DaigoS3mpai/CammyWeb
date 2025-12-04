import React from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Eye,
  BookOpenText,
  FlaskConical,
  Image,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const HomePage = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <motion.div
      className="flex-1 p-10 flex flex-col items-center justify-center text-center relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        backgroundImage: "url('/bc.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ⭐ Imágenes decorativas laterales */}
      <img
        src="/decor-left.png"
        alt="Decoración izquierda"
        className="hidden md:block pointer-events-none select-none absolute left-[-40px] top-32 w-64 opacity-90"
      />
      <img
        src="/decor-right.png"
        alt="Decoración derecha"
        className="hidden md:block pointer-events-none select-none absolute right-[-40px] top-24 w-64 opacity-90"
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.h1
          className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-500 mb-4 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Bienvenido a Cammy-Gotchi
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white mb-10 max-w-3xl leading-relaxed bg-black/40 p-6 rounded-3xl shadow-lg border border-white/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Hola, soy{" "}
          <span className="font-semibold text-pink-300">Camila Aguirre</span>,
          estudiante de
          <span className="italic"> Pedagogía en Educación Básica </span> de la
          Universidad de Chile. Este es mi proyecto para la asignatura{" "}
          <span className="italic">Proyecto Tecnológico</span>, donde compartiré
          mis clases y los proyectos que realizaremos en conjunto con mis
          compañeros, dándoles un enfoque{" "}
          <span className="font-bold text-pink-400">
            pedagógico y didáctico
          </span>{" "}
          para fomentar la enseñanza y aprendizaje de nuestros futuros
          estudiantes. 🌸✨
        </motion.p>

        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8">
          {isAuthenticated() && (
            <>
              <Link
                to="/category/bitacora"
                className="flex flex-col items-center p-6 rounded-3xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <Eye className="w-12 h-12 text-blue-300 mb-3" />
                <h3 className="text-lg font-semibold text-white">
                  Visualizar Apuntes
                </h3>
                <p className="text-gray-200 text-sm mt-1">
                  Explora el conocimiento existente 📖✨.
                </p>
              </Link>

              {isAdmin() && (
                <Link
                  to="/new-class"
                  className="flex flex-col items-center p-6 rounded-3xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <UploadCloud className="w-12 h-12 text-green-300 mb-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Subir Contenidos
                  </h3>
                  <p className="text-gray-200 text-sm mt-1">
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
                className="flex flex-col items-center p-6 rounded-3xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <BookOpenText className="w-12 h-12 text-blue-300 mb-3" />
                <h3 className="text-lg font-semibold text-white">Bitácora</h3>
                <p className="text-gray-200 text-sm mt-1">
                  Explora reflexiones y experiencias 📖✨.
                </p>
              </Link>

              <Link
                to="/category/proyectos"
                className="flex flex-col items-center p-6 rounded-3xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <FlaskConical className="w-12 h-12 text-purple-300 mb-3" />
                <h3 className="text-lg font-semibold text-white">Proyectos</h3>
                <p className="text-gray-200 text-sm mt-1">
                  Mira los trabajos y actividades 🧩.
                </p>
              </Link>

              <Link
                to="/category/galeria"
                className="flex flex-col items-center p-6 rounded-3xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <Image className="w-12 h-12 text-pink-300 mb-3" />
                <h3 className="text-lg font-semibold text-white">Galería</h3>
                <p className="text-gray-200 text-sm mt-1">
                  Descubre momentos y fotografías 📸.
                </p>
              </Link>

              {/* 🔹 Nueva tarjeta Planificación también visible sin login */}
              <Link
                to="/category/planificacion"
                className="flex flex-col items-center p-6 rounded-3xl border border-white/40 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <Image className="w-12 h-12 text-yellow-300 mb-3" />
                <h3 className="text-lg font-semibold text-white">
                  Planificación
                </h3>
                <p className="text-gray-200 text-sm mt-1">
                  Revisa planificaciones y documentos 📑.
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
