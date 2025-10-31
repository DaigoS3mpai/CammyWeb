import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, User, Lock } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!username.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Por favor, completa todos los campos." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Guardar token y datos del usuario en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        setMessage({
          type: "success",
          text: `Bienvenido, ${data.usuario.nombre}! Redirigiendo... 🚀`,
        });

        // 🔁 Redirigir después de 2 segundos
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Credenciales incorrectas. Intenta nuevamente.",
        });
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setMessage({
        type: "error",
        text: "Error al conectar con el servidor. Intenta más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.6,
          type: "spring",
          stiffness: 100,
        }}
      >
        {/* Icono superior */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <LogIn className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">
          Bienvenido de nuevo
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usuario */}
          <motion.div
            className="relative"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
              required
            />
          </motion.div>

          {/* Contraseña */}
          <motion.div
            className="relative"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
              required
            />
          </motion.div>

          {/* Mensaje */}
          {message.text && (
            <motion.p
              className={`text-sm font-medium ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {message.text}
            </motion.p>
          )}

          {/* Botón */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </motion.button>
        </form>

        {/* Registro */}
        <motion.p
          className="mt-8 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-semibold"
          >
            Regístrate aquí
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
