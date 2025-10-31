import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpenText,
  PlusCircle,
  Home,
  LogOut,
  FlaskConical,
  Image,
  BookPlus,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 shadow-2xl flex items-center justify-between flex-wrap"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 🔹 Logo / título */}
      <div
        className="flex items-center flex-shrink-0 mr-6 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
          CammyWeb
        </h1>
      </div>

      {/* 🔹 Menú de navegación */}
      <div className="flex-grow flex justify-center">
        <div className="flex items-center space-x-4">
          {/* 🏠 Inicio */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? "bg-white text-indigo-600"
                  : "text-white hover:bg-white hover:text-indigo-600"
              }`
            }
          >
            <Home className="w-5 h-5 mr-1" /> Inicio
          </NavLink>

          {/* 📘 Bitácora */}
          <NavLink
            to="/category/bitacora"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-white hover:text-blue-600"
              }`
            }
          >
            <BookOpenText className="w-5 h-5 mr-1" /> Bitácora
          </NavLink>

          {/* 🧪 Proyectos */}
          <NavLink
            to="/category/proyectos"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? "bg-white text-purple-600"
                  : "text-white hover:bg-white hover:text-purple-600"
              }`
            }
          >
            <FlaskConical className="w-5 h-5 mr-1" /> Proyectos
          </NavLink>

          {/* 🖼️ Galería */}
          <NavLink
            to="/category/galeria"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? "bg-white text-pink-600"
                  : "text-white hover:bg-white hover:text-pink-600"
              }`
            }
          >
            <Image className="w-5 h-5 mr-1" /> Galería
          </NavLink>

          {/* 🧑‍🏫 Botones de administración */}
          {isAdmin() && (
            <>
              <NavLink
                to="/new-class"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                    isActive
                      ? "bg-white text-green-600"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`
                }
              >
                <BookPlus className="w-5 h-5 mr-1" /> Nueva Clase
              </NavLink>

              <NavLink
                to="/new-project"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                    isActive
                      ? "bg-white text-emerald-600"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`
                }
              >
                <PlusCircle className="w-5 h-5 mr-1" /> Nuevo Proyecto
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* 🔹 Botón de cerrar sesión */}
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
