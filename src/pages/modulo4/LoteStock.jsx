import { useEffect, useState } from "react";
import { listarLotesStock } from "../../services/Modulo4";

export default function LoteStock() {
  const [lotes, setLotes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    listarLotesStock()
      .then(setLotes)
      .finally(() => setCargando(false));
  }, []);

  const lotesFiltrados = lotes.filter((l) => {
    const q = busqueda.toLowerCase();
    return (
      l.codigo_lote?.toLowerCase().includes(q) ||
      l.repuesto?.toLowerCase().includes(q) ||
      l.estado?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Control de Lotes de Stock</h1>
          <p className="mt-1 text-sm text-ink-400">
            Trazabilidad por lote de compra, fechas de ingreso, vencimiento y unidades disponibles.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por código de lote, repuesto o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{lotesFiltrados.length} lotes</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Código de Lote</th>
              <th className="px-4 py-3 font-medium">Repuesto</th>
              <th className="px-4 py-3 font-medium">Ingreso / Vencimiento</th>
              <th className="px-4 py-3 font-medium">Inicial / Disponible</th>
              <th className="px-4 py-3 font-medium">Costo Unit.</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  Cargando lotes de stock…
                </td>
              </tr>
            )}

            {!cargando && lotesFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron lotes registrados.
                </td>
              </tr>
            )}

            {!cargando &&
              lotesFiltrados.map((l) => (
                <tr key={l.id_lote_stock} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-700">{l.codigo_lote}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{l.repuesto}</td>
                  <td className="px-4 py-3 text-xs text-ink-600">
                    <p>Ingreso: {l.fecha_ingreso}</p>
                    <p className="text-ink-400">Vence: {l.fecha_vencimiento || "N/A"}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    <span className="font-semibold">{l.cantidad_disponible}</span> / {l.cantidad_inicial} u.
                  </td>
                  <td className="px-4 py-3 text-ink-700">Bs {Number(l.costo_unitario).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        l.estado === "ACTIVO"
                          ? "bg-green-100 text-green-700"
                          : l.estado === "AGOTADO"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {l.estado}
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
