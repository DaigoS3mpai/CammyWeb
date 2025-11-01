import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import NewClassPage from "./components/NewClassPage";
import CategoryPage from "./components/CategoryPage";
import GalleryPage from "./components/GalleryPage";
import NewProjectPage from "./components/NewProjectPage";
import { AuthProvider, useAuth } from "./components/AuthContext";

// 🔹 Páginas nuevas (puedes ajustarlas luego)
const BitacoraPage = () => (
  <div className="p-10 text-center">
    <h1 className="text-4xl font-bold text-pink-600 mb-4">Bitácora</h1>
    <p className="text-gray-700">Aquí se mostrarán las experiencias y reflexiones 💭.</p>
  </div>
);

const ProyectosPage = () => (
  <div className="p-10 text-center">
    <h1 className="text-4xl font-bold text-yellow-600 mb-4">Proyectos</h1>
    <p className="text-gray-700">Explora los trabajos y actividades 🧩.</p>
  </div>
);

const GaleriaPage = () => (
  <div className="p-10 text-center">
    <h1 className="text-4xl font-bold text-purple-600 mb-4">Galería</h1>
    <p className="text-gray-700">Mira fotos y momentos destacados 📸.</p>
  </div>
);

// 🔹 Rutas con animación
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 🔓 Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🌍 Rutas visibles para todos (autenticados o no) */}
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        {/* 🆕 Rutas nuevas del HomePage (solo visibles para no logeados) */}
        <Route path="/bitacora" element={<BitacoraPage />} />
        <Route path="/proyectos" element={<ProyectosPage />} />
        <Route path="/galeria" element={<GaleriaPage />} />

        {/* 👑 Solo para administradores */}
        {isAdmin() && (
          <>
            <Route path="/new-class" element={<NewClassPage />} />
            <Route path="/newproject" element={<NewProjectPage />} />
          </>
        )}

        {/* 🚫 Protección: si no está logueado e intenta acceder a páginas admin */}
        {!isAuthenticated() && (
          <>
            <Route
              path="/new-class"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/newproject"
              element={<Navigate to="/login" replace />}
            />
          </>
        )}

        {/* 🧭 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// 🔹 Layout principal
const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ✅ Navbar siempre visible (muestra login/logout dinámicamente) */}
      <Navbar />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
    </div>
  );
};

// 🔹 App raíz
const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
