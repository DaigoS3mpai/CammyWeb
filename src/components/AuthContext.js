import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Intentar cargar el usuario desde localStorage al inicio
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  });

  // Guardar el usuario en localStorage cada vez que cambie
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }, [user]);

  // Simulación de base de datos de usuarios
  const [usersDB, setUsersDB] = useState(() => {
    try {
      const storedUsers = localStorage.getItem('usersDB');
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : {};
      // Asegurarse de que el admin siempre exista con la contraseña deseada
      return {
        ...parsedUsers,
        'admin': { password: '123456', role: 'admin' } // Contraseña actualizada aquí
      };
    } catch (error) {
      console.error("Error parsing stored usersDB:", error);
      return { 'admin': { password: '123456', role: 'admin' } }; // Contraseña actualizada aquí
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
    } catch (error) {
      console.error("Error saving usersDB to localStorage:", error);
    }
  }, [usersDB]);

  const login = (username, password) => {
    const storedUser = usersDB[username];
    if (storedUser && storedUser.password === password) {
      setUser({ username: username, role: storedUser.role });
      return true;
    }
    return false;
  };

  const register = (username, password) => {
    if (usersDB[username]) {
      return { success: false, message: 'Ese usuario ya existe. ¿No eres original?' };
    }
    if (username.length < 3 || password.length < 6) {
      return { success: false, message: 'Usuario mínimo 3 caracteres, contraseña mínimo 6. ¡No seas flojo!' };
    }
    const newUserDB = { ...usersDB, [username]: { password: password, role: 'viewer' } };
    setUsersDB(newUserDB);
    return { success: true, message: '¡Registro exitoso! Ahora a estudiar... o a mirar apuntes.' };
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = () => user !== null;
  const isAdmin = () => user && user.role === 'admin';
  const isViewer = () => user && user.role === 'viewer';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isAdmin, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);