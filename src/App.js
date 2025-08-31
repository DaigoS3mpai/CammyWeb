import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ClassContent from './components/ClassContent';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import NewClassPage from './components/NewClassPage';
import CategoryPage from './components/CategoryPage';
import GalleryPage from './components/GalleryPage';
import { AuthProvider, useAuth } from './components/AuthContext';
import { defaultClasses } from './mock/classes';

// Componente para manejar la ubicación y animaciones de página
const AnimatedRoutes = ({ classes, setClasses }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const handleAddClass = (newClass) => {
    setClasses(prevClasses => [...prevClasses, newClass]);
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        
        {/* Rutas protegidas que requieren autenticación */}
        {isAuthenticated() ? (
          <>
            <Route path="/category/:categoryName" element={<CategoryPage classes={classes} />} />
            <Route path="/class/:classId/bitacora" element={<ClassContent classes={classes} setClasses={setClasses} />} /> {/* Pasar setClasses */}
            <Route path="/class/:classId/experimentos" element={<ClassContent classes={classes} setClasses={setClasses} />} /> {/* Pasar setClasses */}
            <Route path="/class/:classId/galeria" element={<GalleryPage classes={classes} setClasses={setClasses} />} /> {/* Pasar setClasses */}
            {isAdmin() && (
              <Route path="/new-class" element={<NewClassPage onAddClass={handleAddClass} />} />
            )}
            {/* Si el usuario está autenticado y trata de ir a login/register, lo redirigimos a home */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Si no está autenticado y trata de acceder a rutas protegidas, lo redirigimos a login
          <Route path="/category/:categoryName" element={<Navigate to="/login" replace />} />
          // No necesitamos un catch-all aquí, ya que la HomePage es pública
        )}
        {/* Ruta de fallback para cualquier otra ruta no definida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const [classes, setClasses] = useState(defaultClasses);
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* El Navbar solo se muestra si el usuario está autenticado */}
      {isAuthenticated() && <Navbar classes={classes} />}
      <div className="flex-1">
        <AnimatedRoutes classes={classes} setClasses={setClasses} />
      </div>
    </div>
  );
};

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