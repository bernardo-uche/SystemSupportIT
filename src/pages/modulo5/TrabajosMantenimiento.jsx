import { useEffect, useState } from "react";
import {
  listarTrabajosMantenimiento,
  crearTrabajoMantenimiento,
  cambiarEstadoTrabajo,
  listarMantenimientos,
  listarHerramientas,
} from "../../services/Modulo5";
import { listarPersonal } from "../../services/Modulo1";
import { listarRepuestos } from "../../services/Modulo3";
import TablaExpandible from "../../components/TablaExpandible.jsx";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_TRABAJO_VACIO = {
  id_mantenimiento: "",
  tecnico: "",
  fecha_programada: new Date().toISOString().split("T")[0],
  observaciones: "",
  herramientas_usadas: [],
  repuestos_usados: [],
};

export default function TrabajosMantenimiento() {
  const [trabajos, setTrabajos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_TRABAJO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [trabsData, mantsData, persData, herrsData, repsData] = await Promise.all([
        listarTrabajosMantenimiento(),
        listarMantenimientos(),
        listarPersonal(),
        listarHerramientas(),
        listarRepuestos(),
      ]);
      setTrabajos(trabsData);
      setMantenimientos(mantsData.filter((m) => m.estado !== 0));
      setPersonal(persData.filter((p) => p.estado !== 0));
      setHerramientas(herrsData.filter((h) => h.estado !== 0));
      setRepuestos(repsData.filter((r) => r.estado !== 0));
    } finally {
      setCargando(false);
    }
  }

  function toggleHerramienta(nombre) {
    setFormulario((prev) => {
      const exists = prev.herramientas_usadas.includes(nombre);
      return {
        ...prev,
        herramientas_usadas: exists
          ? prev.herramientas_usadas.filter((h) => h !== nombre)
          : [...prev.herramientas_usadas, nombre],
      };
    });
  }

  function toggleRepuesto(nombre) {
    setFormulario((prev) => {
      const exists = prev.repuestos_usados.includes(nombre);
      return {
        ...prev,
        repuestos_usados: exists
          ? prev.repuestos_usados.filter((r) => r !== nombre)
          : [...prev.repuestos_usados, nombre],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.id_mantenimiento) return alert("Selecciona el tipo de mantenimiento.");

    setGuardando(true);
    try {
      const mantObj = mantenimientos.find((m) => String(m.id_mantenimiento) === String(formulario.id_mantenimiento));
      const payload = {
        mantenimiento: mantObj ? mantObj.nombre : "Mantenimiento General",
        tecnico: formulario.tecnico || "Técnico Asignado",
        fecha_programada: formulario.fecha_programada,
        observaciones: formulario.observaciones,
        herramientas_usadas: formulario.herramientas_usadas,
        repuestos_usados: formulario.repuestos_usados,
      };

      const nuevo = await crearTrabajoMantenimiento(payload);
      setTrabajos((prev) => [nuevo, ...prev]);
      setFormulario(FORMULARIO_TRABAJO_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al crear trabajo de mantenimiento.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleCambiarEstado(id, nuevoEstado) {
    try {
      const actualizado = await cambiarEstadoTrabajo(id, nuevoEstado);
      setTrabajos((prev) =>
        prev.map((t) => (t.id_trabajo_mantenimiento === id ? { ...t, ...actualizado } : t))
      );
    } catch (err) {
      alert(err.message || "Error al cambiar estado.");
    }
  }

  const trabajosFiltrados = trabajos.filter((t) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      t.mantenimiento?.toLowerCase().includes(q) ||
      t.tecnico?.toLowerCase().includes(q) ||
      t.observaciones?.toLowerCase().includes(q);

    const coincideEstado = filtroEstado === "TODOS" || t.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Trabajos de Mantenimiento</h1>
          <p className="mt-1 text-sm text-ink-400">
            Programación, ejecución, asignación de personal técnico, herramientas y repuestos.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Programar Trabajo
        </button>
      </div>

      {mostrarFormulario && (
        <Modal titulo="Programar Orden / Trabajo de Mantenimiento" onCerrar={() => setMostrarFormulario(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Tipo de Mantenimiento</label>
                <select
                  value={formulario.id_mantenimiento}
                  onChange={(e) => setFormulario((p) => ({ ...p, id_mantenimiento: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">-- Seleccionar --</option>
                  {mantenimientos.map((m) => (
                    <option key={m.id_mantenimiento} value={m.id_mantenimiento}>
                      {m.nombre} (Bs {m.tarifa_base})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Técnico Asignado</label>
                <select
                  value={formulario.tecnico}
                  onChange={(e) => setFormulario((p) => ({ ...p, tecnico: e.target.value }))}
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">-- Seleccionar --</option>
                  {personal.map((p) => (
                    <option key={p.id_personal} value={`${p.nombre} ${p.apellido}`}>
                      {p.nombre} {p.apellido} ({p.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Programada</label>
                <input
                  type="date"
                  value={formulario.fecha_programada}
                  onChange={(e) => setFormulario((p) => ({ ...p, fecha_programada: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Asignación de Herramientas */}
            <div className="rounded-lg bg-ink-50 p-3.5 border border-ink-100">
              <p className="text-xs font-semibold text-ink-800 mb-2">Herramientas a Utilizar</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
                {herramientas.map((h) => (
                  <label key={h.id_herramienta} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formulario.herramientas_usadas.includes(h.nombre)}
                      onChange={() => toggleHerramienta(h.nombre)}
                      className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{h.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Asignación de Repuestos */}
            <div className="rounded-lg bg-ink-50 p-3.5 border border-ink-100">
              <p className="text-xs font-semibold text-ink-800 mb-2">Repuestos a Consumir</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
                {repuestos.map((r) => (
                  <label key={r.id_repuesto} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formulario.repuestos_usados.includes(r.nombre)}
                      onChange={() => toggleRepuesto(r.nombre)}
                      className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{r.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Observaciones</label>
              <textarea
                rows="2"
                placeholder="Instrucciones o detalles..."
                value={formulario.observaciones}
                onChange={(e) => setFormulario((p) => ({ ...p, observaciones: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
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
                {guardando ? "Registrando…" : "Programar Trabajo"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Buscar por mantenimiento, técnico u observaciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />

        <div className="flex gap-2 text-xs">
          {["TODOS", "pendiente", "en_proceso", "finalizado", "cancelado"].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`rounded-lg px-3 py-1.5 font-medium transition capitalize ${
                filtroEstado === est
                  ? "bg-brand-600 text-white"
                  : "bg-white text-ink-600 border border-ink-100 hover:bg-ink-50"
              }`}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {cargando ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-400">
            Cargando trabajos de mantenimiento…
          </div>
        ) : (
          <TablaExpandible
            items={trabajosFiltrados}
            obtenerId={(t) => t.id_trabajo_mantenimiento}
            renderResumen={(trab) => (
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    Trabajo #{trab.id_trabajo_mantenimiento} · {trab.mantenimiento}
                  </p>
                  <p className="text-xs text-ink-400">
                    Técnico: <span className="font-medium text-ink-700">{trab.tecnico}</span> · Fecha: {trab.fecha_programada}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                      trab.estado === "finalizado"
                        ? "bg-green-100 text-green-700"
                        : trab.estado === "en_proceso"
                        ? "bg-blue-100 text-blue-700"
                        : trab.estado === "cancelado"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {trab.estado}
                  </span>
                  <select
                    value={trab.estado}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCambiarEstado(trab.id_trabajo_mantenimiento, e.target.value)}
                    className="rounded border border-ink-200 bg-white px-2 py-1 text-xs outline-none focus:border-brand-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            )}
            renderDetalle={(trab) => (
              <div className="space-y-2 text-xs text-ink-600">
                {trab.observaciones && (
                  <p><span className="font-semibold text-ink-800">Observaciones:</span> {trab.observaciones}</p>
                )}
                {trab.fecha_inicio && (
                  <p><span className="font-semibold text-ink-800">Inicio de Trabajo:</span> {trab.fecha_inicio}</p>
                )}
                {trab.fecha_fin && (
                  <p><span className="font-semibold text-ink-800">Fin de Trabajo:</span> {trab.fecha_fin}</p>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2 border-t border-ink-100">
                  <div>
                    <p className="font-semibold text-ink-800">🛠️ Herramientas Usadas:</p>
                    {trab.herramientas_usadas && trab.herramientas_usadas.length > 0 ? (
                      <ul className="list-disc list-inside pl-1 text-ink-600">
                        {trab.herramientas_usadas.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-ink-400">Ninguna herramienta asignada.</p>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-ink-800">🔧 Repuestos Consumidos:</p>
                    {trab.repuestos_usados && trab.repuestos_usados.length > 0 ? (
                      <ul className="list-disc list-inside pl-1 text-ink-600">
                        {trab.repuestos_usados.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-ink-400">Ningún repuesto registrado.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
