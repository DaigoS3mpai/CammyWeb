import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, User, Lock } from "lucide-react";
import { useAuth } from "./AuthContext";

const RegisterPage = () => {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password !== confirmar) {
      setMessage({
        type: "error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    setLoading(true);
    const result = await register(nombre, password, confirmar);
    setLoading(false);

    if (result.success) {
      setMessage({
        type: "success",
        text: result.message + " Redirigiendo...",
      });
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMessage({ type: "error", text: result.message });
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
        transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 100 }}
      >
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

        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usuario */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg"
              required
            />
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-lg"
              required
            />
          </div>

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

        <p className="mt-8 text-gray-500 text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-green-600 hover:underline font-semibold"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
