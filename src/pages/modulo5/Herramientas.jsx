import { useEffect, useState } from "react";
import { listarHerramientas, crearHerramienta, actualizarEstadoFisicoHerramienta } from "../../services/Modulo5";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_VACIO = {
  nombre: "",
  categoria: "Herramientas Manuales",
  nro_serie_interno: "",
  estado_fisico: "bueno",
};

export default function Herramientas() {
  const [herramientas, setHerramientas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarHerramientas();
  }, []);

  function cargarHerramientas() {
    setCargando(true);
    listarHerramientas()
      .then(setHerramientas)
      .finally(() => setCargando(false));
  }

  function actualizarCampo(campo, valor) {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.nombre) return alert("Ingresa el nombre de la herramienta.");

    setGuardando(true);
    try {
      const nueva = await crearHerramienta(formulario);
      setHerramientas((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al registrar la herramienta.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleCambiarEstadoFisico(h, nuevoEstadoFisico) {
    try {
      await actualizarEstadoFisicoHerramienta(h.id_herramienta, nuevoEstadoFisico);
      setHerramientas((prev) =>
        prev.map((item) =>
          item.id_herramienta === h.id_herramienta ? { ...item, estado_fisico: nuevoEstadoFisico } : item
        )
      );
    } catch (err) {
      alert(err.message || "Error al actualizar estado físico.");
    }
  }

  const herramientasFiltradas = herramientas.filter((h) => {
    const q = busqueda.toLowerCase();
    return (
      h.nombre?.toLowerCase().includes(q) ||
      h.nro_serie_interno?.toLowerCase().includes(q) ||
      h.categoria?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Control de Herramientas</h1>
          <p className="mt-1 text-sm text-ink-400">
            Inventario y estado físico de herramientas asignables a trabajos de mantenimiento.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nueva Herramienta
        </button>
      </div>

      {mostrarFormulario && (
        <Modal titulo="Registrar Nueva Herramienta" onCerrar={() => setMostrarFormulario(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Nombre de Herramienta</label>
              <input
                type="text"
                placeholder="ej. Estación de Soldadura"
                value={formulario.nombre}
                onChange={(e) => actualizarCampo("nombre", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">N° Serie Interno / Código</label>
              <input
                type="text"
                placeholder="ej. H-007"
                value={formulario.nro_serie_interno}
                onChange={(e) => actualizarCampo("nro_serie_interno", e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Categoría</label>
              <select
                value={formulario.categoria}
                onChange={(e) => actualizarCampo("categoria", e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="Herramientas Electrónicas">Herramientas Electrónicas</option>
                <option value="Herramientas Manuales">Herramientas Manuales</option>
                <option value="Instrumentos de Medición">Instrumentos de Medición</option>
                <option value="Herramientas Especializadas">Herramientas Especializadas</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado Físico Inicial</label>
              <select
                value={formulario.estado_fisico}
                onChange={(e) => actualizarCampo("estado_fisico", e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2 mt-3 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Guardar Herramienta"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, código o categoría…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{herramientasFiltradas.length} herramientas</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Herramienta</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado Físico</th>
              <th className="px-4 py-3 font-medium text-right">Ajustar Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  Cargando herramientas…
                </td>
              </tr>
            )}

            {!cargando && herramientasFiltradas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron herramientas.
                </td>
              </tr>
            )}

            {!cargando &&
              herramientasFiltradas.map((h) => (
                <tr key={h.id_herramienta} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-700">{h.nro_serie_interno}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{h.nombre}</td>
                  <td className="px-4 py-3 text-ink-600 text-xs">{h.categoria}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        h.estado_fisico === "excelente"
                          ? "bg-green-100 text-green-700"
                          : h.estado_fisico === "bueno"
                          ? "bg-blue-100 text-blue-700"
                          : h.estado_fisico === "regular"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {h.estado_fisico}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={h.estado_fisico}
                      onChange={(e) => handleCambiarEstadoFisico(h, e.target.value)}
                      className="rounded border border-ink-200 bg-white px-2 py-1 text-xs outline-none focus:border-brand-500"
                    >
                      <option value="excelente">Excelente</option>
                      <option value="bueno">Bueno</option>
                      <option value="regular">Regular</option>
                      <option value="malo">Malo</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
