import { useEffect, useState } from "react";
import { listarOrdenes } from "../../services/ordenService";

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

export default function OrdenesServicio() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    listarOrdenes()
      .then(setOrdenes)
      .finally(() => setCargando(false));
  }, []);

  const ordenesFiltradas =
    filtroEstado === "todos"
      ? ordenes
      : ordenes.filter((o) => o.estado === filtroEstado);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Órdenes de servicio</h1>
          <p className="mt-1 text-sm text-ink-400">Datos ficticios de ejemplo.</p>
        </div>

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
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Técnico asignado</th>
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

            {ordenesFiltradas.map((o) => (
              <tr key={o.id_orden} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3 text-ink-900">
                  {o.cliente.nombre} {o.cliente.apellido}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {o.personal.nombre} {o.personal.apellido}
                </td>
                <td className="px-4 py-3 text-ink-600">{o.problema_reportado}</td>
                <td className="px-4 py-3 text-ink-600">{o.fecha_ingreso}</td>
                <td className="px-4 py-3 text-ink-600">Bs {o.costo.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTILOS_ESTADO[o.estado]}`}
                  >
                    {ETIQUETAS_ESTADO[o.estado]}
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