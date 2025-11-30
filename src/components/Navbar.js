import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpenText,
  PlusCircle,
  Home,
  LogOut,
  LogIn,
  FlaskConical,
  Image,
  FileText,   // 👈 NUEVO ICONO
} from "lucide-react";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          Cammy-Gotchi
        </h1>
      </div>

      {/* 🔹 Menú de navegación */}
      <div className="flex-grow flex justify-center">
        <div className="flex items-center space-x-4">
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

          {/* 🆕 NUEVA CATEGORÍA — PLANIFICACIÓN */}
          <NavLink
            to="/category/planificacion"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md font-semibold transition duration-300 ${
                isActive
                  ? "bg-white text-yellow-600"
                  : "text-white hover:bg-white hover:text-yellow-600"
              }`
            }
          >
            <FileText className="w-5 h-5 mr-1" /> Planificación
          </NavLink>

          {/* 🔒 Solo para admin */}
          {isAdmin() && (
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
              <PlusCircle className="w-5 h-5 mr-1" /> Nueva Clase
            </NavLink>
          )}
        </div>
      </div>

      {/* 🔹 Sección derecha: sesión */}
      <div className="flex items-center space-x-3">
        {isAuthenticated() ? (
          <>
            <span className="font-semibold">
              👋 Hola, {user?.nombre || "Usuario"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 font-semibold border-2 rounded-md text-white border-white hover:bg-white hover:text-pink-600 transition duration-300"
            >
              <LogOut className="w-5 h-5 mr-1" /> Cerrar Sesión
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center px-3 py-2 font-semibold border-2 rounded-md text-white border-white hover:bg-white hover:text-blue-600 transition duration-300"
          >
            <LogIn className="w-5 h-5 mr-1" /> Iniciar Sesión
          </NavLink>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
