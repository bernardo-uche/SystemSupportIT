import { useEffect, useState } from "react";
import { listarOrdenes, crearOrdenServicio } from "../../services/Modulo1/ordenService";
import { listarClientes } from "../../services/Modulo1/clienteService";
import { listarPersonal } from "../../services/Modulo1/personalService";
import Modal from "../../components/Modal.jsx";

const ESTILOS_ESTADO = {
  pendiente: "bg-amber-50 text-amber-700",
  en_proceso: "bg-blue-50 text-blue-700",
  finalizada: "bg-green-50 text-green-700",
  Anulado: "bg-red-50 text-red-700",
};

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  finalizada: "Finalizada",
  Anulado: "Anulado",
};

const FORMULARIO_VACIO = {
  id_cliente: "",
  id_personal: "",
  problema_reportado: "",
  costo: 100,
  fecha_entrega: "",
  estado: "pendiente",
};

export default function OrdenesServicio() {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [ordsData, clisData, persData] = await Promise.all([
        listarOrdenes(),
        listarClientes(),
        listarPersonal(),
      ]);
      setOrdenes(ordsData);
      setClientes(clisData);
      setPersonal(persData);
    } finally {
      setCargando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.id_cliente || !formulario.problema_reportado) {
      return alert("Selecciona cliente e ingresa el problema reportado.");
    }

    setGuardando(true);
    try {
      const clienteObj = clientes.find((c) => String(c.id_cliente) === String(formulario.id_cliente));
      const personalObj = personal.find((p) => String(p.id_personal) === String(formulario.id_personal));

      const payload = {
        id_cliente: Number(formulario.id_cliente),
        cliente: clienteObj ? { nombre: clienteObj.nombre, apellido: clienteObj.apellido } : null,
        id_personal: formulario.id_personal ? Number(formulario.id_personal) : null,
        personal: personalObj ? { nombre: personalObj.nombre, apellido: personalObj.apellido } : null,
        problema_reportado: formulario.problema_reportado,
        costo: Number(formulario.costo),
        fecha_entrega: formulario.fecha_entrega || new Date().toISOString().split("T")[0],
        estado: formulario.estado,
      };

      const nueva = await crearOrdenServicio(payload);
      setOrdenes((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarModal(false);
    } catch (err) {
      alert(err.message || "Error al crear la orden de servicio.");
    } finally {
      setGuardando(false);
    }
  }

  const ordenesFiltradas =
    filtroEstado === "todos"
      ? ordenes
      : ordenes.filter((o) => o.estado === filtroEstado);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Órdenes de Servicio</h1>
          <p className="mt-1 text-sm text-ink-400">Seguimiento de reparaciones e ingreso de equipos.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-56"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="finalizada">Finalizada</option>
            <option value="Anulado">Anulado</option>
          </select>

          <button
            onClick={() => setMostrarModal(true)}
            className="whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Nueva Órden
          </button>
        </div>
      </div>

      {mostrarModal && (
        <Modal titulo="Registrar Nueva Órden de Servicio" onCerrar={() => setMostrarModal(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Cliente</label>
              <select
                value={formulario.id_cliente}
                onChange={(e) => setFormulario((p) => ({ ...p, id_cliente: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Técnico Asignado</label>
              <select
                value={formulario.id_personal}
                onChange={(e) => setFormulario((p) => ({ ...p, id_personal: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Seleccionar Técnico --</option>
                {personal.map((p) => (
                  <option key={p.id_personal} value={p.id_personal}>
                    {p.nombre} {p.apellido} ({p.cargo})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Problema Reportado</label>
              <textarea
                rows="2"
                placeholder="ej. No enciende, pantalla azul, fallo en disco..."
                value={formulario.problema_reportado}
                onChange={(e) => setFormulario((p) => ({ ...p, problema_reportado: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Costo Estimado (Bs)</label>
              <input
                type="number"
                min="0"
                value={formulario.costo}
                onChange={(e) => setFormulario((p) => ({ ...p, costo: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Entrega Estimada</label>
              <input
                type="date"
                value={formulario.fecha_entrega}
                onChange={(e) => setFormulario((p) => ({ ...p, fecha_entrega: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado Inicial</label>
              <select
                value={formulario.estado}
                onChange={(e) => setFormulario((p) => ({ ...p, estado: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2 mt-3 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Registrando…" : "Guardar Órden"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Técnico Asignado</th>
              <th className="px-4 py-3 font-medium">Problema</th>
              <th className="px-4 py-3 font-medium">Ingreso</th>
              <th className="px-4 py-3 font-medium">Costo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  Cargando órdenes…
                </td>
              </tr>
            )}

            {!cargando && ordenesFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  No hay órdenes con este estado.
                </td>
              </tr>
            )}

            {!cargando &&
              ordenesFiltradas.map((o) => (
                <tr key={o.id_orden} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 text-ink-900 font-medium">
                    {o.cliente?.nombre ? `${o.cliente.nombre} ${o.cliente.apellido}` : `Cliente #${o.id_cliente}`}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {o.personal?.nombre ? `${o.personal.nombre} ${o.personal.apellido}` : `Personal #${o.id_personal || "Sin asignar"}`}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{o.problema_reportado}</td>
                  <td className="px-4 py-3 text-ink-600 text-xs">{o.fecha_ingreso}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    Bs {Number(o.costo || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILOS_ESTADO[o.estado] || "bg-ink-100 text-ink-600"}`}
                    >
                      {ETIQUETAS_ESTADO[o.estado] || o.estado}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}