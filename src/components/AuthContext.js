import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 🔹 Usamos la misma clave "usuario" que usa LoginPage.js
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  });

  // 🔹 Guardar/limpiar usuario en localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
    } else {
      localStorage.removeItem("usuario");
    }
  }, [user]);

  // 🔹 Registro real
  const register = async (nombre, password, confirmar) => {
    try {
      const res = await fetch("/.netlify/functions/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password, confirmar }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      else return { success: false, message: data.error || data };
    } catch (err) {
      return { success: false, message: "Error en el registro: " + err.message };
    }
  };

  // 🔹 Login real (guarda también en localStorage)
  const login = async (nombre, password) => {
    try {
      const res = await fetch("/.netlify/functions/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.usuario);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        return { success: true };
      } else {
        return { success: false, message: data.error || data };
      }
    } catch (err) {
      return { success: false, message: "Error en el login: " + err.message };
    }
  };

  // 🔹 Cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuario");
  };

  // 🔹 Helpers
  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.rol === "admin";

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
