import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpenText, PlusCircle, Home, LogOut, FlaskConical, Image } from 'lucide-react';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const { isAdmin, logout } = useAuth();

  // 👉 ID fijo de tu clase principal "Proyectos Tecnológicos"
  const CLASS_ID = 1;

  return (
    <motion.nav
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 shadow-2xl flex items-center justify-between flex-wrap"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Logo / título */}
      <div className="flex items-center flex-shrink-0 mr-6">
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
          CammyWeb
        </h1>
      </div>

      {/* Menú de navegación */}
      <div className="flex-grow flex justify-center">
        <div className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white hover:text-indigo-600'
              }`
            }
          >
            <Home className="w-5 h-5 mr-1" /> Inicio
          </NavLink>

          <NavLink
            to={`/class/${CLASS_ID}/bitacora`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? 'bg-white text-purple-600'
                  : 'text-white hover:bg-white hover:text-purple-600'
              }`
            }
          >
            <BookOpenText className="w-5 h-5 mr-1" /> Bitácora
          </NavLink>

          <NavLink
            to={`/class/${CLASS_ID}/experimentos`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? 'bg-white text-pink-600'
                  : 'text-white hover:bg-white hover:text-pink-600'
              }`
            }
          >
            <FlaskConical className="w-5 h-5 mr-1" /> Proyectos
          </NavLink>

          <NavLink
            to={`/class/${CLASS_ID}/galeria`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? 'bg-white text-rose-600'
                  : 'text-white hover:bg-white hover:text-rose-600'
              }`
            }
          >
            <Image className="w-5 h-5 mr-1" /> Galería
          </NavLink>

          {isAdmin() && (
            <NavLink
              to="/new-class"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                  isActive
                    ? 'bg-white text-green-600'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`
              }
            >
              <PlusCircle className="w-5 h-5 mr-1" /> Nueva Clase
            </NavLink>
          )}
        </div>
      </div>

      {/* Botón cerrar sesión */}
      <div>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 font-semibold border-2 rounded-md text-white border-white hover:bg-white hover:text-pink-600 transition duration-300"
        >
          <LogOut className="w-5 h-5 mr-1" /> Cerrar Sesión
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
