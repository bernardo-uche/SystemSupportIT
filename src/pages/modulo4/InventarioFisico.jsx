import { useEffect, useState } from "react";
import { listarInventariosFisicos, registrarInventarioFisico, listarInventario } from "../../services/Modulo4";

export default function InventarioFisico() {
  const [registros, setRegistros] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [idInventarioSel, setIdInventarioSel] = useState("");
  const [stockContado, setStockContado] = useState(0);
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [fisicosData, invData] = await Promise.all([
        listarInventariosFisicos(),
        listarInventario(),
      ]);
      setRegistros(fisicosData);
      setInventario(invData);
    } finally {
      setCargando(false);
    }
  }

  const itemSeleccionado = inventario.find((i) => String(i.id_inventario) === String(idInventarioSel));
  const stockSistema = itemSeleccionado ? itemSeleccionado.repuesto?.stock_actual || 0 : 0;
  const diferencia = Number(stockContado) - stockSistema;

  let resultadoCalculado = "CONFORME";
  if (diferencia < 0) resultadoCalculado = "FALTANTE";
  else if (diferencia > 0) resultadoCalculado = "SOBRANTE";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!idInventarioSel) return alert("Selecciona un artículo del inventario.");

    setGuardando(true);
    try {
      const payload = {
        id_inventario: Number(idInventarioSel),
        repuesto: itemSeleccionado.repuesto?.nombre,
        stock_sistema: stockSistema,
        stock_contado: Number(stockContado),
        diferencia: diferencia,
        resultado: resultadoCalculado,
        observacion: observacion,
      };

      const nuevo = await registrarInventarioFisico(payload);
      setRegistros((prev) => [nuevo, ...prev]);
      setIdInventarioSel("");
      setStockContado(0);
      setObservacion("");
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al registrar conteo físico.");
    } finally {
      setGuardando(false);
    }
  }

  const registrosFiltrados = registros.filter((r) => {
    const q = busqueda.toLowerCase();
    return (
      r.repuesto?.toLowerCase().includes(q) ||
      r.resultado?.toLowerCase().includes(q) ||
      r.observacion?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Auditoría e Inventario Físico</h1>
          <p className="mt-1 text-sm text-ink-400">
            Conciliación de stock contado físicamente contra existencias del sistema.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Registrar Conteo Físico"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-brand-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold text-ink-800 border-b border-ink-100 pb-2">
            Registrar Conteo de Inventario Físico
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Repuesto / Artículo</label>
              <select
                value={idInventarioSel}
                onChange={(e) => setIdInventarioSel(e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Seleccionar Repuesto para Conteo --</option>
                {inventario.map((item) => (
                  <option key={item.id_inventario} value={item.id_inventario}>
                    {item.repuesto?.nombre} (Ubicación: {item.ubicacion || "Sin Ubicación"}) - Stock Sistema: {item.repuesto?.stock_actual} u.
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Stock Contado Físicamente</label>
              <input
                type="number"
                min="0"
                value={stockContado}
                onChange={(e) => setStockContado(e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {itemSeleccionado && (
            <div className="rounded-lg bg-ink-50 p-3 text-xs flex items-center justify-between border border-ink-100">
              <div>
                <p><span className="font-semibold">Stock en Sistema:</span> {stockSistema} u.</p>
                <p><span className="font-semibold">Stock Contado:</span> {stockContado} u.</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">
                  Diferencia:{" "}
                  <span className={diferencia < 0 ? "text-red-600" : diferencia > 0 ? "text-amber-600" : "text-green-600"}>
                    {diferencia > 0 ? `+${diferencia}` : diferencia} u.
                  </span>
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    resultadoCalculado === "CONFORME"
                      ? "bg-green-100 text-green-700"
                      : resultadoCalculado === "FALTANTE"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {resultadoCalculado}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-800">Observaciones del Conteo</label>
            <input
              type="text"
              placeholder="ej. Una unidad rota o no localizada en estante"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Guardar Conteo"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar auditoría por repuesto, resultado u observación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{registrosFiltrados.length} auditorías</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha Conteo</th>
              <th className="px-4 py-3 font-medium">Repuesto / Pieza</th>
              <th className="px-4 py-3 font-medium">Sistema vs Contado</th>
              <th className="px-4 py-3 font-medium">Diferencia</th>
              <th className="px-4 py-3 font-medium">Resultado</th>
              <th className="px-4 py-3 font-medium">Observación</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  Cargando registros de conteo físico…
                </td>
              </tr>
            )}

            {!cargando && registrosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron auditorías registradas.
                </td>
              </tr>
            )}

            {!cargando &&
              registrosFiltrados.map((r) => (
                <tr key={r.id_inventario_fisico} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 text-xs text-ink-500">{r.fecha_conteo}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{r.repuesto}</td>
                  <td className="px-4 py-3 text-ink-700 text-xs">
                    Sistema: <span className="font-semibold">{r.stock_sistema}</span> | Contado:{" "}
                    <span className="font-semibold">{r.stock_contado}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    <span className={r.diferencia < 0 ? "text-red-600" : r.diferencia > 0 ? "text-amber-600" : "text-green-600"}>
                      {r.diferencia > 0 ? `+${r.diferencia}` : r.diferencia}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        r.resultado === "CONFORME"
                          ? "bg-green-100 text-green-700"
                          : r.resultado === "FALTANTE"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.resultado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{r.observacion || "-"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
