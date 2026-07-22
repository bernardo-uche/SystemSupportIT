import { useEffect, useState } from "react";
import { listarCotizaciones, crearCotizacion, listarOfertas } from "../../services/Modulo2";
import { listarClientes, listarOrdenes } from "../../services/Modulo1";
import { listarRepuestos } from "../../services/Modulo3";
import TablaExpandible from "../../components/TablaExpandible.jsx";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_COTIZACION_VACIO = {
  id_cliente: "",
  id_orden: "",
  id_oferta: "",
  observacion: "",
  detalles: [],
};

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [repuestos, setRepuestos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_COTIZACION_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [lineaTemp, setLineaTemp] = useState({ concepto: "", cantidad: 1, precio: 0 });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [cotsData, clisData, ordsData, ofsData, repsData] = await Promise.all([
        listarCotizaciones(),
        listarClientes(),
        listarOrdenes(),
        listarOfertas(),
        listarRepuestos(),
      ]);
      setCotizaciones(cotsData);
      setClientes(clisData);
      setOrdenes(ordsData);
      setOfertas(ofsData.filter((o) => o.estado !== 0));
      setRepuestos(repsData);
    } catch (err) {
      console.error("Error al cargar datos de cotizaciones:", err);
    } finally {
      setCargando(false);
    }
  }

  function handleAgregarLinea() {
    if (!lineaTemp.concepto) return alert("Ingresa un concepto o repuesto.");
    if (lineaTemp.cantidad <= 0) return alert("La cantidad debe ser mayor a 0.");
    if (lineaTemp.precio < 0) return alert("El precio no puede ser negativo.");

    const subtotal = Number(lineaTemp.cantidad) * Number(lineaTemp.precio);
    const nueva = {
      id_detalle: Date.now() + Math.random(),
      concepto: lineaTemp.concepto,
      cantidad: Number(lineaTemp.cantidad),
      precio_unitario: Number(lineaTemp.precio),
      subtotal,
    };

    setFormulario((prev) => ({
      ...prev,
      detalles: [...prev.detalles, nueva],
    }));

    setLineaTemp({ concepto: "", cantidad: 1, precio: 0 });
  }

  function handleQuitarLinea(idDetalle) {
    setFormulario((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.id_detalle !== idDetalle),
    }));
  }

  const subtotalSumado = formulario.detalles.reduce((acc, d) => acc + d.subtotal, 0);
  const ofertaSeleccionada = ofertas.find((o) => String(o.id_oferta) === String(formulario.id_oferta));
  const porcentajeDescuento = ofertaSeleccionada ? (ofertaSeleccionada.descuento_porcentaje || ofertaSeleccionada.porcentaje || 0) : 0;
  const montoDescuento = (subtotalSumado * porcentajeDescuento) / 100;
  const totalFinal = subtotalSumado - montoDescuento;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.id_cliente) return alert("Selecciona un cliente.");
    if (formulario.detalles.length === 0) return alert("Agrega al menos una línea a la cotización.");

    setGuardando(true);
    try {
      const clienteObj = clientes.find((c) => String(c.id_cliente) === String(formulario.id_cliente));
      const clienteNombre = clienteObj ? `${clienteObj.nombre} ${clienteObj.apellido}` : "Cliente";

      const payload = {
        cliente: clienteNombre,
        nro_cotizacion: `COT-${Math.floor(1000 + Math.random() * 9000)}`,
        id_cliente: Number(formulario.id_cliente),
        id_orden: formulario.id_orden ? Number(formulario.id_orden) : null,
        subtotal: subtotalSumado,
        descuento: montoDescuento,
        total: totalFinal,
        oferta: ofertaSeleccionada ? (ofertaSeleccionada.nombre || ofertaSeleccionada.of_nombre) : null,
        observacion: formulario.observacion,
        detalles: formulario.detalles,
      };

      const nueva = await crearCotizacion(payload);
      setCotizaciones((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_COTIZACION_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al crear la cotización.");
    } finally {
      setGuardando(false);
    }
  }

  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    const q = busqueda.toLowerCase();
    const clienteStr = typeof c.cliente === "string" ? c.cliente : `${c.cliente?.nombre || ""} ${c.cliente?.apellido || ""}`;
    const nroStr = String(c.nro_cotizacion || "");
    const ofertaStr = typeof c.oferta === "string" ? c.oferta : c.oferta?.nombre || c.oferta?.of_nombre || "";

    return (
      nroStr.toLowerCase().includes(q) ||
      clienteStr.toLowerCase().includes(q) ||
      ofertaStr.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Cotizaciones</h1>
          <p className="mt-1 text-sm text-ink-400">
            Elaboración de presupuestos y cotizaciones vinculadas a clientes u órdenes de servicio.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nueva Cotización
        </button>
      </div>

      {mostrarFormulario && (
        <Modal titulo="Elaborar Nueva Cotización" onCerrar={() => setMostrarFormulario(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Cliente</label>
                <select
                  value={formulario.id_cliente}
                  onChange={(e) => setFormulario((p) => ({ ...p, id_cliente: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map((cli) => (
                    <option key={cli.id_cliente} value={cli.id_cliente}>
                      {cli.nombre} {cli.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Órden de Servicio (Opcional)</label>
                <select
                  value={formulario.id_orden}
                  onChange={(e) => setFormulario((p) => ({ ...p, id_orden: e.target.value }))}
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">-- Ninguna --</option>
                  {ordenes.map((ord) => (
                    <option key={ord.id_orden} value={ord.id_orden}>
                      Órden #{ord.id_orden} - {ord.problema_reportado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Aplicar Oferta / Descuento</label>
                <select
                  value={formulario.id_oferta}
                  onChange={(e) => setFormulario((p) => ({ ...p, id_oferta: e.target.value }))}
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">-- Sin Descuento --</option>
                  {ofertas.map((of) => (
                    <option key={of.id_oferta} value={of.id_oferta}>
                      {of.nombre || of.of_nombre} (-{of.descuento_porcentaje || of.porcentaje}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Agregar líneas de ítems/repuestos */}
            <div className="rounded-lg bg-ink-50 p-3.5 border border-ink-100 space-y-2">
              <p className="text-xs font-semibold text-ink-800">Agregar Ítems / Repuestos a la Cotización</p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-ink-600">Concepto / Repuesto</label>
                  <select
                    value={lineaTemp.concepto}
                    onChange={(e) => {
                      const val = e.target.value;
                      const rep = repuestos.find((r) => r.nombre === val);
                      setLineaTemp((prev) => ({
                        ...prev,
                        concepto: val,
                        precio: rep ? rep.precio_venta || 0 : prev.precio,
                      }));
                    }}
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none"
                  >
                    <option value="">-- Seleccionar o escribir abajo --</option>
                    {repuestos.map((r) => (
                      <option key={r.id_repuesto} value={r.nombre}>
                        {r.nombre} (Bs {r.precio_venta})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="O escribe un servicio personalizado (ej. Mano de obra)"
                    value={lineaTemp.concepto}
                    onChange={(e) => setLineaTemp((prev) => ({ ...prev, concepto: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-ink-600">Precio (Bs)</label>
                  <input
                    type="number"
                    min="0"
                    value={lineaTemp.precio}
                    onChange={(e) => setLineaTemp((prev) => ({ ...prev, precio: e.target.value }))}
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAgregarLinea}
                    className="w-full rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    + Agregar Ítem
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de ítems de la cotización */}
            <div className="overflow-x-auto rounded-lg border border-ink-100 max-h-40 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50 text-ink-600 border-b border-ink-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Concepto / Descripción</th>
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
                        No se han agregado ítems a la cotización.
                      </td>
                    </tr>
                  ) : (
                    formulario.detalles.map((d) => (
                      <tr key={d.id_detalle} className="border-b border-ink-100 last:border-0">
                        <td className="px-3 py-2 font-medium text-ink-900">{d.concepto}</td>
                        <td className="px-3 py-2 text-ink-700">{d.cantidad}</td>
                        <td className="px-3 py-2 text-ink-700">Bs {Number(d.precio_unitario).toFixed(2)}</td>
                        <td className="px-3 py-2 font-semibold text-ink-900">Bs {Number(d.subtotal).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleQuitarLinea(d.id_detalle)}
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

            <div className="rounded-lg bg-brand-50 p-3 text-xs space-y-1 text-brand-900 border border-brand-200">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">Bs {subtotalSumado.toFixed(2)}</span>
              </div>
              {porcentajeDescuento > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento ({ofertaSeleccionada?.nombre || ofertaSeleccionada?.of_nombre} -{porcentajeDescuento}%):</span>
                  <span className="font-semibold">-Bs {montoDescuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-brand-800 pt-1 border-t border-brand-200">
                <span>TOTAL FINAL:</span>
                <span>Bs {totalFinal.toFixed(2)}</span>
              </div>
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
                {guardando ? "Generando…" : "Guardar Cotización"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por N° cotización, cliente u oferta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{cotizacionesFiltradas.length} cotizaciones</p>
      </div>

      <div className="mt-4">
        {cargando ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-400">
            Cargando cotizaciones…
          </div>
        ) : (
          <TablaExpandible
            items={cotizacionesFiltradas}
            obtenerId={(c) => c.id_cotizacion}
            renderResumen={(cot) => {
              const clienteNombre = typeof cot.cliente === "string" ? cot.cliente : `${cot.cliente?.nombre || ""} ${cot.cliente?.apellido || ""}`;
              const ofertaNombre = typeof cot.oferta === "string" ? cot.oferta : cot.oferta?.nombre || cot.oferta?.of_nombre || null;

              return (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{cot.nro_cotizacion}</p>
                      <span className="text-xs text-ink-400">· {clienteNombre}</span>
                      {ofertaNombre && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          {ofertaNombre}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-400">Fecha: {cot.fecha_registro}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-700">Bs {Number(cot.total || cot.monto_total || 0).toFixed(2)}</p>
                    {Number(cot.descuento || 0) > 0 && (
                      <p className="text-[10px] text-red-600">Ahorro: Bs {Number(cot.descuento).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              );
            }}
            renderDetalle={(cot) => {
              const listaDetalles = cot.detalles || cot.detalle || [];
              return (
                <div className="space-y-2">
                  {cot.observacion && (
                    <p className="text-xs text-ink-500 italic">Observaciones: {cot.observacion}</p>
                  )}
                  <table className="w-full text-left text-xs">
                    <thead className="text-xs text-ink-400 border-b border-ink-100">
                      <tr>
                        <th className="pb-2 font-medium">Concepto</th>
                        <th className="pb-2 font-medium">Cantidad</th>
                        <th className="pb-2 font-medium">Precio Unit.</th>
                        <th className="pb-2 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaDetalles.map((l, idx) => {
                        const concepto = l.concepto || l.repuesto || l.equipo || "Ítem de Servicio";
                        const cant = l.cantidad || 1;
                        const pu = l.precio_unitario !== undefined ? l.precio_unitario : l.precio || 0;
                        const sub = l.subtotal !== undefined ? l.subtotal : cant * pu;

                        return (
                          <tr key={l.id_detalle || l.id_detalle_cotizacion || idx} className="border-b border-ink-100/50 last:border-0">
                            <td className="py-1 text-ink-800">{concepto}</td>
                            <td className="py-1 text-ink-600">{cant}</td>
                            <td className="py-1 text-ink-600">Bs {Number(pu).toFixed(2)}</td>
                            <td className="py-1 font-medium text-ink-900">Bs {Number(sub).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
