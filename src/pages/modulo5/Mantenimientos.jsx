import { useEffect, useState } from "react";
import { listarMantenimientos, crearMantenimiento } from "../../services/Modulo5";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_VACIO = {
  nombre: "",
  descripcion: "",
  tarifa_base: 50,
  tiempo_estimado: 60,
  estado: 1,
};

export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarMantenimientos();
  }, []);

  function cargarMantenimientos() {
    setCargando(true);
    listarMantenimientos()
      .then(setMantenimientos)
      .finally(() => setCargando(false));
  }

  function actualizarCampo(campo, valor) {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.nombre) return alert("Ingresa el nombre del servicio de mantenimiento.");

    setGuardando(true);
    try {
      const nuevo = await crearMantenimiento(formulario);
      setMantenimientos((prev) => [nuevo, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al crear servicio.");
    } finally {
      setGuardando(false);
    }
  }

  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    const q = busqueda.toLowerCase();
    return m.nombre?.toLowerCase().includes(q) || m.descripcion?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Catálogo de Mantenimientos</h1>
          <p className="mt-1 text-sm text-ink-400">
            Definición de tipos de servicio técnico, tarifas base y tiempos estimados.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nuevo Mantenimiento
        </button>
      </div>

      {mostrarFormulario && (
        <Modal titulo="Registrar Tipo de Mantenimiento" onCerrar={() => setMostrarFormulario(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Nombre del Servicio</label>
              <input
                type="text"
                placeholder="ej. Mantenimiento Preventivo"
                value={formulario.nombre}
                onChange={(e) => actualizarCampo("nombre", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Tarifa Base (Bs)</label>
              <input
                type="number"
                min="0"
                value={formulario.tarifa_base}
                onChange={(e) => actualizarCampo("tarifa_base", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Tiempo Estimado (Minutos)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={formulario.tiempo_estimado}
                onChange={(e) => actualizarCampo("tiempo_estimado", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado del Servicio</label>
              <select
                value={formulario.estado}
                onChange={(e) => actualizarCampo("estado", Number(e.target.value))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value={1}>Activo (Disponible)</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Descripción del Servicio</label>
              <textarea
                rows="2"
                placeholder="Detalle de actividades contempladas..."
                value={formulario.descripcion}
                onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
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
                {guardando ? "Guardando…" : "Guardar Mantenimiento"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción de servicio…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{mantenimientosFiltrados.length} tipos de servicio</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cargando && (
          <div className="col-span-full py-12 text-center text-sm text-ink-400">
            Cargando catálogo de mantenimientos…
          </div>
        )}

        {!cargando && mantenimientosFiltrados.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-ink-400">
            No se encontraron mantenimientos.
          </div>
        )}

        {!cargando &&
          mantenimientosFiltrados.map((m) => (
            <div
              key={m.id_mantenimiento}
              className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink-900 text-base">{m.nombre}</h3>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    Bs {Number(m.tarifa_base).toFixed(2)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-600">{m.descripcion || "Sin descripción"}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400">
                <span>⏱️ Duración: <strong className="text-ink-700">{m.tiempo_estimado} min</strong></span>
                <span className={`rounded-full px-2 py-0.5 font-medium ${m.estado !== 0 ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"}`}>
                  {m.estado !== 0 ? "Disponible" : "Inactivo"}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
