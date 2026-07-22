import { useEffect, useState } from "react";
import { listarInventario, actualizarUbicacionInventario } from "../../services/Modulo4";
import Modal from "../../components/Modal.jsx";

export default function Inventario() {
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [itemEditando, setItemEditando] = useState(null);
  const [ubicacionForm, setUbicacionForm] = useState("");
  const [stockMinForm, setStockMinForm] = useState(0);
  const [stockMaxForm, setStockMaxForm] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarInventario();
  }, []);

  function cargarInventario() {
    setCargando(true);
    listarInventario()
      .then(setInventario)
      .finally(() => setCargando(false));
  }

  function abrirEdicion(item) {
    setItemEditando(item);
    setUbicacionForm(item.ubicacion || "");
    setStockMinForm(item.stock_minimo || 0);
    setStockMaxForm(item.stock_maximo || 0);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await actualizarUbicacionInventario(itemEditando.id_inventario, ubicacionForm, stockMinForm, stockMaxForm);
      setInventario((prev) =>
        prev.map((i) =>
          i.id_inventario === itemEditando.id_inventario
            ? { ...i, ubicacion: ubicacionForm, stock_minimo: Number(stockMinForm), stock_maximo: Number(stockMaxForm) }
            : i
        )
      );
      setItemEditando(null);
    } catch (err) {
      alert(err.message || "Error al actualizar.");
    } finally {
      setGuardando(false);
    }
  }

  const inventarioFiltrado = inventario.filter((i) => {
    const q = busqueda.toLowerCase();
    return (
      i.repuesto?.nombre?.toLowerCase().includes(q) ||
      i.repuesto?.codigo?.toLowerCase().includes(q) ||
      i.ubicacion?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Control de Inventario</h1>
          <p className="mt-1 text-sm text-ink-400">
            Stock disponible, niveles de reabastecimiento y ubicación física en almacén.
          </p>
        </div>
      </div>

      {itemEditando && (
        <Modal
          titulo={`Ajustar Almacén: ${itemEditando.repuesto?.nombre}`}
          onCerrar={() => setItemEditando(null)}
        >
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-ink-800">Ubicación en Almacén</label>
                <input
                  type="text"
                  value={ubicacionForm}
                  onChange={(e) => setUbicacionForm(e.target.value)}
                  placeholder="ej. Estante A-01"
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Stock Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={stockMinForm}
                  onChange={(e) => setStockMinForm(e.target.value)}
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-800">Stock Máximo</label>
                <input
                  type="number"
                  min="0"
                  value={stockMaxForm}
                  onChange={(e) => setStockMaxForm(e.target.value)}
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setItemEditando(null)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Actualizar Ubicación"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar repuesto por nombre, código o ubicación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{inventarioFiltrado.length} artículos</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Repuesto / Pieza</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Stock Actual</th>
              <th className="px-4 py-3 font-medium">Mín / Máx</th>
              <th className="px-4 py-3 font-medium">Estado Stock</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  Cargando inventario…
                </td>
              </tr>
            )}

            {!cargando && inventarioFiltrado.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron elementos en inventario.
                </td>
              </tr>
            )}

            {!cargando &&
              inventarioFiltrado.map((item) => {
                const stockActual = item.repuesto?.stock_actual || 0;
                const esBajoStock = stockActual <= item.stock_minimo;

                return (
                  <tr key={item.id_inventario} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{item.repuesto?.nombre}</p>
                      <p className="text-xs text-ink-400">Cód: {item.repuesto?.codigo}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600 font-mono text-xs">{item.ubicacion || "Sin asignar"}</td>
                    <td className="px-4 py-3 font-bold text-ink-900">{stockActual} u.</td>
                    <td className="px-4 py-3 text-ink-600 text-xs">
                      {item.stock_minimo} / {item.stock_maximo}
                    </td>
                    <td className="px-4 py-3">
                      {esBajoStock ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          ⚠️ Reabastecer
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          ✓ Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => abrirEdicion(item)}
                        className="rounded px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Ajustar Ubicación
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
