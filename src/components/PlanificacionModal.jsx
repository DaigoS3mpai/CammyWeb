import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  Pencil,
  Save,
  Loader2,
  PlusCircle,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const PlanificacionModal = ({ item, onClose }) => {
  const { isAdmin } = useAuth();

  const [editMode, setEditMode] = useState(item?.isNew || false);
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [descripcion, setDescripcion] = useState(item?.descripcion || "");
  const [portada, setPortada] = useState(item?.imagen_portada || "");
  const [proyectoId, setProyectoId] = useState(item?.proyecto_id || "");

  // lista de archivos adjuntos
  const [archivos, setArchivos] = useState([]);
  const [nuevoArchivo, setNuevoArchivo] = useState(null);

  const [allProyectos, setAllProyectos] = useState([]);

  // Cargar archivos adjuntos si NO es nueva planificación
  useEffect(() => {
    if (!item?.id) return;

    fetch("/.netlify/functions/getPlanificacionArchivos?id=" + item.id)
      .then((r) => r.json())
      .then((data) => setArchivos(Array.isArray(data) ? data : []));
  }, [item]);

  // cargar proyectos
  useEffect(() => {
    fetch("/.netlify/functions/getProyectos")
      .then((r) => r.json())
      .then((data) => setAllProyectos(Array.isArray(data) ? data : []));
  }, []);

  // subir archivos RAW (PDF, PPT, etc)
  const uploadRawFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64 = reader.result;

        const res = await fetch("/.netlify/functions/uploadPlanFile", {
          method: "POST",
          body: JSON.stringify({
            fileBase64: base64,
            filename: file.name.replace(/\.[^/.]+$/, ""), // sin extensión
          }),
        });

        const data = await res.json();
        resolve(data.url || null);
      };
      reader.readAsDataURL(file);
    });
  };

  // subir portada (imagen normal)
  const uploadPortada = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64 = reader.result;

        const res = await fetch("/.netlify/functions/uploadImagen", {
          method: "POST",
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await res.json();
        resolve(data.url || null);
      };

      reader.readAsDataURL(file);
    });
  };

  // Guardar planificación
  const handleSave = async () => {
    if (!titulo.trim()) {
      alert("El título no puede estar vacío.");
      return;
    }

    setSaving(true);
    try {
      if (item.isNew) {
        // crear nueva planificación
        const res = await fetch("/.netlify/functions/addPlanificacion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo,
            descripcion,
            imagen_portada: portada,
            proyecto_id: proyectoId || null,
          }),
        });

        const data = await res.json();
        if (!data?.data?.id) throw new Error("Error creando planificación");

        item.id = data.data.id; // asignamos el ID recién creado
      } else {
        // actualizar planificación existente
        await fetch("/.netlify/functions/updatePlanificacion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            titulo,
            descripcion,
            imagen_portada: portada,
            proyecto_id: proyectoId || null,
          }),
        });
      }

      // si hay archivo nuevo, subirlo
      if (nuevoArchivo) {
        const url = await uploadRawFile(nuevoArchivo);
        if (url) {
          await fetch("/.netlify/functions/addArchivoPlanificacion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planificacion_id: item.id,
              archivo_url: url,
              tipo_archivo: nuevoArchivo.type,
              titulo: nuevoArchivo.name,
            }),
          });
        }
      }

      alert("Guardado correctamente");
      setEditMode(false);
      onClose(true);
    } catch (err) {
      console.error(err);
      alert("Error guardando planificación");
    } finally {
      setSaving(false);
    }
  };

  const updateArchivo = async (id, titulo, descripcion) => {
    await fetch("/.netlify/functions/updateArchivoPlanificacion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, titulo, descripcion }),
    });
    alert("Archivo actualizado");
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => onClose(false)}
        >
          <motion.div
            className="relative rounded-xl shadow-2xl bg-[#faf6f1] w-full max-w-4xl p-6 border border-[#d5c3a5]"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {/* botones */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {isAdmin() && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}

              {editMode && (
                <>
                  <button
                    disabled={saving}
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 rounded-full p-2"
                    onClick={() => setEditMode(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}

              <button
                onClick={() => onClose(false)}
                className="bg-[#f0e9de] hover:bg-[#e4d9c7] rounded-full p-2"
              >
                <X className="w-5 h-5 text-[#5a4633]" />
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              {/* IZQUIERDA - PORTADA Y META */}
              <div>
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-[#4e3c2b] mb-3">
                    {editMode ? (
                      <input
                        className="w-full border-b border-[#c3b8a5] bg-transparent focus:outline-none"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                      />
                    ) : (
                      titulo
                    )}
                  </h2>

                  <div className="flex items-center text-[#7a4e27] mb-2">
                    <BookOpen className="w-5 h-5 mr-2" />
                    {item.proyecto_titulo || "Sin proyecto vinculado"}
                  </div>
                </div>

                {/* portada */}
                {portada ? (
                  <img
                    src={portada}
                    alt="portada"
                    className="rounded-xl w-full h-60 object-cover border border-[#d3c2aa]"
                  />
                ) : (
                  <p className="text-gray-500 italic">Sin portada.</p>
                )}

                {editMode && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">
                      Cambiar portada
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          uploadPortada(file).then((url) => {
                            if (url) setPortada(url);
                          });
                        }
                      }}
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    />
                  </div>
                )}
              </div>

              {/* DERECHA - DESCRIPCIÓN + ARCHIVOS */}
              <div>
                {/* descripción */}
                <h3 className="text-xl font-semibold text-[#4e3c2b] flex items-center mb-2">
                  <FileText className="w-5 h-5 mr-2" /> Descripción
                </h3>

                {editMode ? (
                  <textarea
                    className="w-full h-40 p-3 border border-[#c3b8a5] rounded-lg bg-white"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                ) : (
                  <div className="bg-white border border-[#d3c2aa] rounded-lg p-4 text-[#4e3c2b] min-h-[150px] whitespace-pre-line">
                    {descripcion || "Sin descripción."}
                  </div>
                )}

                {/* archivos adjuntos */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-[#4e3c2b] flex items-center">
                    <FileText className="w-5 h-5 mr-2" /> Archivos adjuntos
                  </h3>

                  {archivos.length === 0 ? (
                    <p className="text-gray-500 italic mt-2">No hay archivos.</p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {archivos.map((a) => (
                        <div
                          key={a.id}
                          className="border rounded-lg p-3 bg-white flex justify-between items-center"
                        >
                          {/* info archivo */}
                          <div>
                            {editMode ? (
                              <>
                                <input
                                  className="border-b border-gray-400 bg-transparent mb-1 w-full"
                                  value={a.titulo || ""}
                                  onChange={(e) => {
                                    const x = [...archivos];
                                    const idx = x.findIndex((z) => z.id === a.id);
                                    x[idx].titulo = e.target.value;
                                    setArchivos(x);
                                  }}
                                />
                                <textarea
                                  className="border border-gray-300 rounded w-full p-1"
                                  rows={2}
                                  value={a.descripcion || ""}
                                  onChange={(e) => {
                                    const x = [...archivos];
                                    const idx = x.findIndex((z) => z.id === a.id);
                                    x[idx].descripcion = e.target.value;
                                    setArchivos(x);
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    updateArchivo(a.id, a.titulo, a.descripcion)
                                  }
                                  className="text-sm mt-1 bg-green-600 text-white px-2 py-1 rounded"
                                >
                                  Guardar
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="font-semibold">{a.titulo}</p>
                                <p className="text-sm text-gray-500">
                                  {a.descripcion || "Sin descripción"}
                                </p>
                              </>
                            )}
                          </div>

                          {/* botón descargar */}
                          <a
                            href={a.archivo_url}
                            target="_blank"
                            className="text-blue-700 font-semibold flex items-center"
                          >
                            <Download className="w-5 h-5 mr-1" /> Descargar
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* agregar archivo */}
                  {editMode && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold mb-1">
                        Agregar archivo (PDF, PPT, DOCX…)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx"
                        onChange={(e) => setNuevoArchivo(e.target.files[0])}
                        className="border border-gray-300 rounded-lg p-2 w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanificacionModal;
