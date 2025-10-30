import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ClassContent from './components/ClassContent';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import NewClassPage from './components/NewClassPage';
import CategoryPage from './components/CategoryPage';
import GalleryPage from './components/GalleryPage';
import NewProjectPage from './components/NewProjectPage'; // ✅ nuevo componente
import { AuthProvider, useAuth } from './components/AuthContext';

// 🔹 Maneja las rutas con animación
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔒 Protegidas */}
        {isAuthenticated() ? (
          <>
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/class/:classId/:tab" element={<ClassContent />} />
            <Route path="/gallery" element={<GalleryPage />} />

            {/* ✅ Nueva ruta para crear proyectos */}
            {isAdmin() && (
              <>
                <Route path="/new-class" element={<NewClassPage />} />
                <Route path="/newproject" element={<NewProjectPage />} />
              </>
            )}

            {/* Si está logueado y va a login/register → redirigir */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* Si NO está autenticado */}
            <Route
              path="/category/:categoryName"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/class/:classId/:tab"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/gallery"
              element={<Navigate to="/login" replace />}
            />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// 🔹 Layout principal
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {isAuthenticated() && <Navbar />}
      <div className="flex-1">
        <AnimatedRoutes />
      </div>
    </div>
  );
};

// 🔹 App raíz
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
