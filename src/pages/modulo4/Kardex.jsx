import { useEffect, useState } from "react";
import { listarKardex } from "../../services/Modulo4";

export default function Kardex() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  useEffect(() => {
    listarKardex()
      .then(setMovimientos)
      .finally(() => setCargando(false));
  }, []);

  const movimientosFiltrados = movimientos.filter((m) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      m.repuesto?.toLowerCase().includes(q) ||
      m.concepto?.toLowerCase().includes(q) ||
      m.referencia?.toLowerCase().includes(q);

    const coincideTipo = filtroTipo === "TODOS" || m.tipo_movimiento === filtroTipo;

    return coincideBusqueda && coincideTipo;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Kardex de Inventario</h1>
          <p className="mt-1 text-sm text-ink-400">
            Registro cronológico de Entradas (Compras), Salidas (Ventas/Servicios) y Ajustes de Stock.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Buscar por repuesto, concepto o referencia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />

        <div className="flex gap-2 text-xs">
          {["TODOS", "ENTRADA", "SALIDA", "AJUSTE"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                filtroTipo === tipo
                  ? "bg-brand-600 text-white"
                  : "bg-white text-ink-600 border border-ink-100 hover:bg-ink-50"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha / Hora</th>
              <th className="px-4 py-3 font-medium">Repuesto</th>
              <th className="px-4 py-3 font-medium">Tipo Movimiento</th>
              <th className="px-4 py-3 font-medium">Entrada / Salida</th>
              <th className="px-4 py-3 font-medium">Saldo Ant ➔ Act</th>
              <th className="px-4 py-3 font-medium">Concepto / Ref</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  Cargando movimientos de Kardex…
                </td>
              </tr>
            )}

            {!cargando && movimientosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron movimientos registrados.
                </td>
              </tr>
            )}

            {!cargando &&
              movimientosFiltrados.map((m) => (
                <tr key={m.id_kardex} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 text-xs text-ink-500">{m.fecha_movimiento}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{m.repuesto}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        m.tipo_movimiento === "ENTRADA"
                          ? "bg-green-100 text-green-700"
                          : m.tipo_movimiento === "SALIDA"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m.tipo_movimiento}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {m.cantidad_entrada > 0 ? (
                      <span className="text-green-600">+{m.cantidad_entrada} u.</span>
                    ) : (
                      <span className="text-red-600">-{m.cantidad_salida} u.</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">
                    {m.saldo_anterior} ➔ <span className="font-bold text-ink-900">{m.saldo_actual}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">
                    <p className="font-medium text-ink-800">{m.concepto}</p>
                    <p className="text-ink-400 font-mono">Ref: {m.referencia}</p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
