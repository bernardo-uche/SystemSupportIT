import { useEffect, useState } from "react";
import { listarVentas, crearVenta, listarRepuestos } from "../../services/Modulo3";
import { listarClientes } from "../../services/Modulo1";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_VACIO = {
  id_cliente: "",
  metodo_pago: "Efectivo",
  vendedor: "Vendedor Turno",
  detalles: [],
};

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandida, setExpandida] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [lineaTemp, setLineaTemp] = useState({ id_repuesto: "", cantidad: 1 });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [ventasData, clisData, repsData] = await Promise.all([
        listarVentas(),
        listarClientes(),
        listarRepuestos(),
      ]);
      setVentas(ventasData);
      setClientes(clisData);
      setRepuestos(repsData);
    } finally {
      setCargando(false);
    }
  }

  function alternarExpandida(id) {
    setExpandida((actual) => (actual === id ? null : id));
  }

  function handleAgregarLinea() {
    if (!lineaTemp.id_repuesto) return alert("Selecciona un repuesto.");
    if (lineaTemp.cantidad <= 0) return alert("La cantidad debe ser mayor a 0.");

    const repObj = repuestos.find((r) => String(r.id_repuesto) === String(lineaTemp.id_repuesto));
    const precio = repObj ? repObj.precio_venta || 0 : 0;
    const subtotal = Number(lineaTemp.cantidad) * precio;

    const nuevaLinea = {
      id_detalle_venta: Date.now() + Math.random(),
      id_repuesto: repObj.id_repuesto,
      repuesto: repObj.nombre,
      cantidad: Number(lineaTemp.cantidad),
      precio_unitario: precio,
      subtotal: subtotal,
    };

    setFormulario((prev) => ({ ...prev, detalles: [...prev.detalles, nuevaLinea] }));
    setLineaTemp({ id_repuesto: "", cantidad: 1 });
  }

  function handleQuitarLinea(idLine) {
    setFormulario((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.id_detalle_venta !== idLine),
    }));
  }

  const totalCalculado = formulario.detalles.reduce((acc, d) => acc + d.subtotal, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.id_cliente) return alert("Selecciona un cliente.");
    if (formulario.detalles.length === 0) return alert("Agrega al menos un repuesto a la venta.");

    setGuardando(true);
    try {
      const clienteObj = clientes.find((c) => String(c.id_cliente) === String(formulario.id_cliente));
      const payload = {
        cliente: { nombre: clienteObj?.nombre || "Cliente", apellido: clienteObj?.apellido || "" },
        vendedor: { nombre: formulario.vendedor },
        metodo_pago: formulario.metodo_pago,
        total: totalCalculado,
        detalle: formulario.detalles,
      };

      const nueva = await crearVenta(payload);
      setVentas((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarModal(false);
    } catch (err) {
      alert(err.message || "Error al registrar venta.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Ventas</h1>
          <p className="mt-1 text-sm text-ink-400">
            Registro de ventas de repuestos directas al cliente.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nueva Venta
        </button>
      </div>

      {mostrarModal && (
        <Modal titulo="Registrar Nueva Venta" onCerrar={() => setMostrarModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <label className="mb-1 block text-xs font-medium text-ink-800">Método de Pago</label>
                <select
                  value={formulario.metodo_pago}
                  onChange={(e) => setFormulario((p) => ({ ...p, metodo_pago: e.target.value }))}
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="QR">Código QR</option>
                </select>
              </div>
            </div>

            {/* Agregar Repuestos */}
            <div className="rounded-lg bg-ink-50 p-3.5 border border-ink-100 space-y-2">
              <p className="text-xs font-semibold text-ink-800">Agregar Repuesto a la Venta</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-ink-600">Repuesto</label>
                  <select
                    value={lineaTemp.id_repuesto}
                    onChange={(e) => setLineaTemp((p) => ({ ...p, id_repuesto: e.target.value }))}
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none"
                  >
                    <option value="">-- Seleccionar --</option>
                    {repuestos.map((r) => (
                      <option key={r.id_repuesto} value={r.id_repuesto}>
                        {r.nombre} (Bs {r.precio_venta})
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
                    onChange={(e) => setLineaTemp((p) => ({ ...p, cantidad: e.target.value }))}
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

            {/* Detalle actual */}
            <div className="overflow-x-auto rounded-lg border border-ink-100 max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50 text-ink-600 border-b border-ink-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Repuesto</th>
                    <th className="px-3 py-2">Cantidad</th>
                    <th className="px-3 py-2">Precio Unit.</th>
                    <th className="px-3 py-2">Subtotal</th>
                    <th className="px-3 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {formulario.detalles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-ink-400">
                        No se han agregado repuestos.
                      </td>
                    </tr>
                  ) : (
                    formulario.detalles.map((d) => (
                      <tr key={d.id_detalle_venta} className="border-b border-ink-100 last:border-0">
                        <td className="px-3 py-2 font-medium text-ink-900">{d.repuesto}</td>
                        <td className="px-3 py-2 text-ink-700">{d.cantidad}</td>
                        <td className="px-3 py-2 text-ink-700">Bs {d.precio_unitario.toFixed(2)}</td>
                        <td className="px-3 py-2 font-semibold text-ink-900">Bs {d.subtotal.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleQuitarLinea(d.id_detalle_venta)}
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
                Total Venta: <span className="text-brand-600 text-lg">Bs {totalCalculado.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
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
                  {guardando ? "Registrando…" : "Confirmar Venta"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-6 space-y-3">
        {cargando ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-400">
            Cargando ventas…
          </div>
        ) : (
          ventas.map((venta) => {
            const abierta = expandida === venta.id_venta;

            return (
              <div
                key={venta.id_venta}
                className="overflow-hidden rounded-xl border border-ink-100 bg-white"
              >
                <button
                  onClick={() => alternarExpandida(venta.id_venta)}
                  className="flex w-full flex-col gap-2 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {venta.cliente?.nombre} {venta.cliente?.apellido}
                    </p>
                    <p className="text-xs text-ink-400">
                      {venta.fecha} · {venta.metodo_pago} · vendió {venta.vendedor?.nombre || "Vendedor"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink-900">
                      Bs {Number(venta.total).toFixed(2)}
                    </span>
                    <span
                      className={`text-ink-400 transition-transform ${abierta ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </div>
                </button>

                {abierta && (
                  <div className="border-t border-ink-100 bg-ink-50 px-4 py-3">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-ink-400">
                        <tr>
                          <th className="pb-2 font-medium">Repuesto</th>
                          <th className="pb-2 font-medium">Cantidad</th>
                          <th className="pb-2 font-medium">Precio unit.</th>
                          <th className="pb-2 font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venta.detalle?.map((linea) => (
                          <tr key={linea.id_detalle_venta}>
                            <td className="py-1 text-ink-800">{linea.repuesto}</td>
                            <td className="py-1 text-ink-600">{linea.cantidad}</td>
                            <td className="py-1 text-ink-600">
                              Bs {Number(linea.precio_unitario).toFixed(2)}
                            </td>
                            <td className="py-1 text-ink-600">Bs {Number(linea.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}