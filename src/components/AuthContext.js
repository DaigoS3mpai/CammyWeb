import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 🔹 Cargar usuario y token desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("Error cargando usuario:", err);
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 🔹 Iniciar sesión con el backend
  const login = async (nombre, password) => {
    try {
      const res = await fetch("/.netlify/functions/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || "Error al iniciar sesión" };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      setUser(data.usuario);
      setToken(data.token);

      return { success: true, message: "Inicio de sesión exitoso" };
    } catch (err) {
      console.error("Error en login:", err);
      return { success: false, message: "Error al conectar con el servidor." };
    }
  };

  // 🔹 Registrar usuario nuevo en la base de datos
  const register = async (nombre, password, confirmar) => {
    try {
      const res = await fetch("/.netlify/functions/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password, confirmar }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || "Error al registrar usuario" };
      }

      return { success: true, message: "Registro exitoso" };
    } catch (err) {
      console.error("Error en register:", err);
      return { success: false, message: "Error al conectar con el servidor." };
    }
  };

  // 🔹 Cerrar sesión
  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // 🔹 Utilidades
  const isAuthenticated = () => !!user && !!token;
  const isAdmin = () => user?.rol === "admin";
  const isUsuario = () => user?.rol === "usuario";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        isUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
