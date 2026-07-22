import { useEffect, useState } from "react";
import { listarCompras, crearCompra, anularCompra, listarProveedores } from "../../services/Modulo2";
import { listarRepuestos } from "../../services/Modulo3";
import TablaExpandible from "../../components/TablaExpandible.jsx";

const FORMULARIO_COMPRA_VACIO = {
  id_proveedor: "",
  n_documento: "",
  forma_pago: "Efectivo",
  fecha: new Date().toISOString().split("T")[0],
  observacion: "",
  detalles: [],
};

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_COMPRA_VACIO);
  const [guardando, setGuardando] = useState(false);

  // Estado para la línea temporal de producto a agregar
  const [lineaTemp, setLineaTemp] = useState({ id_repuesto: "", cantidad: 1, precio: 0 });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [comprasData, provsData, repsData] = await Promise.all([
        listarCompras(),
        listarProveedores(),
        listarRepuestos(),
      ]);
      setCompras(comprasData);
      setProveedores(provsData.filter((p) => p.estado !== 0));
      setRepuestos(repsData.filter((r) => r.estado !== 0));
    } finally {
      setCargando(false);
    }
  }

  function handleAgregarLinea() {
    if (!lineaTemp.id_repuesto) return alert("Selecciona un repuesto.");
    if (lineaTemp.cantidad <= 0) return alert("La cantidad debe ser mayor a 0.");
    if (lineaTemp.precio < 0) return alert("El precio no puede ser negativo.");

    const repuestoObj = repuestos.find((r) => String(r.id_repuesto) === String(lineaTemp.id_repuesto));
    const subtotal = Number(lineaTemp.cantidad) * Number(lineaTemp.precio);

    const nuevaLinea = {
      id_detalle_compra: Date.now() + Math.random(),
      id_repuesto: repuestoObj.id_repuesto,
      repuesto: repuestoObj.nombre,
      cantidad: Number(lineaTemp.cantidad),
      precio: Number(lineaTemp.precio),
      sub_total: subtotal,
    };

    setFormulario((prev) => ({
      ...prev,
      detalles: [...prev.detalles, nuevaLinea],
    }));

    setLineaTemp({ id_repuesto: "", cantidad: 1, precio: 0 });
  }

  function handleQuitarLinea(idTemp) {
    setFormulario((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.id_detalle_compra !== idTemp),
    }));
  }

  const totalCalculado = formulario.detalles.reduce((acc, d) => acc + d.sub_total, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.id_proveedor) return alert("Selecciona un proveedor.");
    if (formulario.detalles.length === 0) return alert("Debes agregar al menos un repuesto al detalle.");

    setGuardando(true);
    try {
      const proveedorObj = proveedores.find((p) => String(p.id_proveedor) === String(formulario.id_proveedor));
      const payload = {
        n_documento: formulario.n_documento || `COMP-${Math.floor(100 + Math.random() * 900)}`,
        id_proveedor: Number(formulario.id_proveedor),
        proveedor: { id_proveedor: proveedorObj.id_proveedor, nombre: proveedorObj.nombre },
        fecha: formulario.fecha,
        forma_pago: formulario.forma_pago,
        observacion: formulario.observacion,
        total_compra: totalCalculado,
        detalle: formulario.detalles,
      };

      const nueva = await crearCompra(payload);
      setCompras((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_COMPRA_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al registrar la compra.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleAnular(id) {
    if (!confirm("¿Estás seguro de que deseas anular esta compra?")) return;
    try {
      await anularCompra(id);
      setCompras((prev) =>
        prev.map((c) => (c.id_compra === id ? { ...c, estado: 0 } : c))
      );
    } catch (err) {
      alert(err.message || "Error al anular.");
    }
  }

  const comprasFiltradas = compras.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      c.n_documento?.toLowerCase().includes(q) ||
      c.proveedor?.nombre?.toLowerCase().includes(q) ||
      c.forma_pago?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Compras</h1>
          <p className="mt-1 text-sm text-ink-400">
            Registro y control de compras de repuestos y suministros.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Registrar Compra"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-brand-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold text-ink-800 border-b border-ink-100 pb-2">
            Formulario de Nueva Compra
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Proveedor</label>
              <select
                value={formulario.id_proveedor}
                onChange={(e) => setFormulario((p) => ({ ...p, id_proveedor: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Seleccionar Proveedor --</option>
                {proveedores.map((prov) => (
                  <option key={prov.id_proveedor} value={prov.id_proveedor}>
                    {prov.nombre} (NIT: {prov.nit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">N° Documento / Factura</label>
              <input
                type="text"
                placeholder="ej. COMP-007"
                value={formulario.n_documento}
                onChange={(e) => setFormulario((p) => ({ ...p, n_documento: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Forma de Pago</label>
              <select
                value={formulario.forma_pago}
                onChange={(e) => setFormulario((p) => ({ ...p, forma_pago: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Credito">Crédito</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>

          {/* Selector de repuestos para agregar a la tabla */}
          <div className="rounded-lg bg-ink-50 p-3.5 border border-ink-100">
            <p className="text-xs font-semibold text-ink-800 mb-2">Agregar Detalle de Repuestos</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-medium text-ink-600">Repuesto</label>
                <select
                  value={lineaTemp.id_repuesto}
                  onChange={(e) => {
                    const idSelected = e.target.value;
                    const found = repuestos.find((r) => String(r.id_repuesto) === String(idSelected));
                    setLineaTemp((prev) => ({
                      ...prev,
                      id_repuesto: idSelected,
                      precio: found ? found.precio_compra || 0 : 0,
                    }));
                  }}
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">-- Seleccionar Repuesto --</option>
                  {repuestos.map((r) => (
                    <option key={r.id_repuesto} value={r.id_repuesto}>
                      {r.nombre} ({r.codigo || r.marca}) - Precio Compra: Bs {r.precio_compra}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-ink-600">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={lineaTemp.cantidad}
                  onChange={(e) => setLineaTemp((prev) => ({ ...prev, cantidad: e.target.value }))}
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAgregarLinea}
                  className="w-full rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de detalle de la compra actual */}
          <div className="overflow-x-auto rounded-lg border border-ink-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 text-ink-600 border-b border-ink-100">
                <tr>
                  <th className="px-3 py-2">Repuesto</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Precio Unitario</th>
                  <th className="px-3 py-2">Subtotal</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {formulario.detalles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-ink-400">
                      No se han agregado repuestos aún.
                    </td>
                  </tr>
                ) : (
                  formulario.detalles.map((d) => (
                    <tr key={d.id_detalle_compra} className="border-b border-ink-100 last:border-0">
                      <td className="px-3 py-2 font-medium text-ink-900">{d.repuesto}</td>
                      <td className="px-3 py-2 text-ink-700">{d.cantidad}</td>
                      <td className="px-3 py-2 text-ink-700">Bs {d.precio.toFixed(2)}</td>
                      <td className="px-3 py-2 font-semibold text-ink-900">Bs {d.sub_total.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleQuitarLinea(d.id_detalle_compra)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 pt-3">
            <div className="text-sm font-semibold text-ink-900">
              Total Compra: <span className="text-brand-600 text-lg">Bs {totalCalculado.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Registrando…" : "Confirmar Compra"}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por N° documento, proveedor o forma de pago…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{comprasFiltradas.length} compras</p>
      </div>

      <div className="mt-4">
        {cargando ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-400">
            Cargando compras…
          </div>
        ) : (
          <TablaExpandible
            items={comprasFiltradas}
            obtenerId={(c) => c.id_compra}
            renderResumen={(compra) => (
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{compra.n_documento}</p>
                    <span className="text-xs text-ink-400">· {compra.proveedor?.nombre}</span>
                    {compra.estado === 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Anulado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-400">
                    {compra.fecha} · Pago: {compra.forma_pago}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-brand-700">
                    Bs {Number(compra.total_compra).toFixed(2)}
                  </span>
                  {compra.estado !== 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnular(compra.id_compra);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Anular
                    </button>
                  )}
                </div>
              </div>
            )}
            renderDetalle={(compra) => (
              <div className="space-y-2">
                {compra.observacion && (
                  <p className="text-xs text-ink-500 italic">Observaciones: {compra.observacion}</p>
                )}
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-ink-400 border-b border-ink-100">
                    <tr>
                      <th className="pb-2 font-medium">Repuesto</th>
                      <th className="pb-2 font-medium">Cantidad</th>
                      <th className="pb-2 font-medium">Precio</th>
                      <th className="pb-2 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compra.detalle.map((linea) => (
                      <tr key={linea.id_detalle_compra} className="border-b border-ink-100/50 last:border-0">
                        <td className="py-1.5 text-ink-800">{linea.repuesto}</td>
                        <td className="py-1.5 text-ink-600">{linea.cantidad}</td>
                        <td className="py-1.5 text-ink-600">Bs {Number(linea.precio).toFixed(2)}</td>
                        <td className="py-1.5 font-medium text-ink-900">Bs {Number(linea.sub_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}