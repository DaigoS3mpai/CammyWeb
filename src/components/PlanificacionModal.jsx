import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const PlanificacionModal = ({ item, onUpdated }) => {
  const { isAdmin } = useAuth();

  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [descripcion, setDescripcion] = useState(item?.descripcion || "");
  const [archivos, setArchivos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // 🔹 cargar archivos adjuntos
  const fetchArchivos = async () => {
    try {
      const res = await fetch(
        "/.netlify/functions/getPlanificacionArchivos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planificacion_id: item.id }),
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setArchivos(data);
      } else {
        setArchivos([]);
      }
    } catch (err) {
      console.error("Error al cargar archivos:", err);
      setArchivos([]);
    }
  };

  useEffect(() => {
    if (item?.id) {
      setTitulo(item.titulo || "");
      setDescripcion(item.descripcion || "");
      fetchArchivos();
    }
  }, [item]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert("El título no puede estar vacío.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/.netlify/functions/updatePlanificacion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          titulo,
          descripcion,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar planificación.");

      setEditMode(false);
      if (onUpdated) await onUpdated();
      alert("✅ Planificación actualizada");
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo guardar la planificación.");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 subir archivo PDF/PPT
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendo(true);

      // 1) Subir archivo al storage (Cloudinary u otro)
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/.netlify/functions/uploadPlanFile", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error("Error al subir archivo.");
      }

      const archivoUrl = uploadData.url;

      // 2) Guardar registro en BD
      const addRes = await fetch(
        "/.netlify/functions/addArchivoPlanificacion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planificacion_id: item.id,
            archivo_url: archivoUrl,
            tipo_archivo: file.type || "application/octet-stream",
            titulo: file.name,
          }),
        }
      );

      if (!addRes.ok) {
        throw new Error("Error al registrar el archivo en la BD.");
      }

      await fetchArchivos();
      if (onUpdated) await onUpdated();
      alert("✅ Archivo adjuntado correctamente.");
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo adjuntar el archivo.");
    } finally {
      setSubiendo(false);
      e.target.value = ""; // limpiar input
    }
  };

  return (
    <motion.div
      className="bg-[#fdf5eb] rounded-2xl p-8 shadow-xl border border-[#e3d1b3] text-[#4b3826]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
            {titulo || "Sin título"}
          </h2>
          <div className="flex items-center text-sm text-[#7b6248]">
            <BookOpen className="w-4 h-4 mr-2" />
            {item.proyecto_titulo
              ? `Vinculado a: ${item.proyecto_titulo}`
              : "Sin proyecto vinculado"}
          </div>
        </div>

        {isAdmin() && (
          <div className="flex gap-2">
            {editMode && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            )}
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`px-3 py-2 rounded-full text-sm font-semibold flex items-center ${
                editMode
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {editMode ? "Cancelar" : "Editar"}
            </button>
          </div>
        )}
      </div>

      {/* Cuerpo: descripción + archivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Descripción */}
        <div>
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 mr-2 text-[#795548]" />
            <h3 className="text-xl font-semibold">Descripción</h3>
          </div>
          {editMode ? (
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="12"
              className="w-full border border-[#d3c2aa] rounded-xl p-3 text-sm bg-[#fffdf9] resize-none"
              placeholder="Aquí va a agregar los datos de la planificación"
            />
          ) : (
            <div className="bg-[#fffdf9] border border-[#e5d5bc] rounded-xl p-4 text-sm leading-relaxed min-h-[220px] whitespace-pre-line">
              {descripcion || (
                <span className="italic text-[#9c8973]">
                  No hay descripción registrada.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Archivos adjuntos */}
        <div>
          <div className="flex items-center mb-3">
            <Paperclip className="w-5 h-5 mr-2 text-[#795548]" />
            <h3 className="text-xl font-semibold">Archivos adjuntos</h3>
          </div>

          {isAdmin() && (
            <div className="mb-3">
              <label className="block text-xs font-semibold text-[#5b4532] mb-1">
                Adjuntar archivo (PDF, PPT, DOC, etc.)
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-3 py-2 rounded-xl bg-white border border-[#d3c2aa] text-sm cursor-pointer hover:bg-[#fbf6ee]">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {subiendo ? "Subiendo..." : "Elegir archivo"}
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={subiendo}
                  />
                </label>
              </div>
            </div>
          )}

          {archivos.length === 0 ? (
            <p className="text-sm text-[#9c8973] italic mt-2">
              No hay archivos.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {archivos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between bg-white/80 border border-[#e0d0b5] rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#795548]" />
                    <div>
                      <p className="font-semibold">
                        {a.titulo || "Archivo adjunto"}
                      </p>
                      <a
                        href={a.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-700 hover:underline"
                      >
                        Ver / descargar
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlanificacionModal;
