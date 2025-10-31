import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, User, Lock } from "lucide-react";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Las contraseñas no coinciden. ¿Seguro que las escribiste igual?",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: username,
          password,
          confirmar: confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "✅ Registro exitoso. Redirigiendo al inicio de sesión...",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "❌ No se pudo registrar el usuario.",
        });
      }
    } catch (err) {
      console.error("Error al registrar:", err);
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
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Icono superior */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <UserPlus className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        {/* Título */}
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">
          Regístrate
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
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg transition-all duration-300"
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
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg transition-all duration-300"
              required
            />
          </motion.div>

          {/* Confirmar contraseña */}
          <motion.div
            className="relative"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg transition-all duration-300"
              required
            />
          </motion.div>

          {/* Mensaje de error o éxito */}
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
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </motion.button>
        </form>

        {/* Enlace a login */}
        <motion.p
          className="mt-8 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Inicia Sesión aquí
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
