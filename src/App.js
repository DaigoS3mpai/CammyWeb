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

        {/* 🌍 Rutas visibles para todos */}
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        {/* 👑 Solo para administradores */}
        {isAdmin() && (
          <>
            <Route path="/new-class" element={<NewClassPage />} />
            <Route path="/newproject" element={<NewProjectPage />} />
          </>
        )}

        {/* 🚫 Protección: redirigir si no está autenticado */}
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
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, #b3e5fc, #c8e6c9)",
      }}
    >
      {/* ✅ Navbar siempre visible */}
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
