import { useEffect, useState } from "react";
import { listarCotizaciones, crearCotizacion, listarOfertas } from "../../services/Modulo2";
import { listarClientes, listarOrdenes } from "../../services/Modulo1";
import TablaExpandible from "../../components/TablaExpandible.jsx";

const FORMULARIO_VACIO = {
  id_cliente: "",
  id_orden: "",
  id_oferta: "",
  fecha_cad: "",
  detalles: [],
};

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  // Línea temporal de repuesto/equipo para el detalle
  const [lineaTemp, setLineaTemp] = useState({ equipo: "", repuesto: "", precio: 0, cantidad: 1 });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [cotsData, clisData, ordsData, ofsData] = await Promise.all([
        listarCotizaciones(),
        listarClientes(),
        listarOrdenes(),
        listarOfertas(),
      ]);
      setCotizaciones(cotsData);
      setClientes(clisData);
      setOrdenes(ordsData);
      setOfertas(ofsData.filter((o) => o.estado !== 0));
    } finally {
      setCargando(false);
    }
  }

  function handleAgregarLinea() {
    if (!lineaTemp.equipo) return alert("Ingresa el nombre del equipo.");
    if (!lineaTemp.repuesto) return alert("Ingresa el repuesto o servicio.");
    if (lineaTemp.precio <= 0) return alert("El precio debe ser mayor a 0.");

    const nueva = {
      id_detalle_cotizacion: Date.now() + Math.random(),
      equipo: lineaTemp.equipo,
      repuesto: lineaTemp.repuesto,
      precio: Number(lineaTemp.precio),
      cantidad: Number(lineaTemp.cantidad),
      descuento: 0,
    };

    setFormulario((prev) => ({
      ...prev,
      detalles: [...prev.detalles, nueva],
    }));

    setLineaTemp({ equipo: "", repuesto: "", precio: 0, cantidad: 1 });
  }

  function handleQuitarLinea(idTemp) {
    setFormulario((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.id_detalle_cotizacion !== idTemp),
    }));
  }

  const subtotalLineas = formulario.detalles.reduce((acc, d) => acc + d.precio * d.cantidad, 0);

  // Aplicar porcentaje de oferta si se selecciona
  const ofertaSeleccionada = ofertas.find((o) => String(o.id_oferta) === String(formulario.id_oferta));
  const porcentajeDescuento = ofertaSeleccionada ? ofertaSeleccionada.porcentaje : 0;
  const montoDescuento = (subtotalLineas * porcentajeDescuento) / 100;
  const totalFinal = subtotalLineas - montoDescuento;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.id_cliente) return alert("Selecciona un cliente.");
    if (formulario.detalles.length === 0) return alert("Agrega al menos un detalle a la cotización.");

    setGuardando(true);
    try {
      const clienteObj = clientes.find((c) => String(c.id_cliente) === String(formulario.id_cliente));
      const ordenObj = ordenes.find((o) => String(o.id_orden) === String(formulario.id_orden));

      const payload = {
        cliente: { id_cliente: clienteObj.id_cliente, nombre: clienteObj.nombre, apellido: clienteObj.apellido },
        orden: ordenObj ? { id_orden: ordenObj.id_orden, problema_reportado: ordenObj.problema_reportado } : null,
        oferta: ofertaSeleccionada ? { id_oferta: ofertaSeleccionada.id_oferta, of_nombre: ofertaSeleccionada.of_nombre, porcentaje: ofertaSeleccionada.porcentaje } : null,
        fecha_cad: formulario.fecha_cad || "2026-12-31",
        monto_total: totalFinal,
        descuento: montoDescuento,
        detalle: formulario.detalles,
      };

      const nueva = await crearCotizacion(payload);
      setCotizaciones((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al crear cotización.");
    } finally {
      setGuardando(false);
    }
  }

  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      c.cliente?.nombre?.toLowerCase().includes(q) ||
      c.cliente?.apellido?.toLowerCase().includes(q) ||
      c.orden?.problema_reportado?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Cotizaciones</h1>
          <p className="mt-1 text-sm text-ink-400">
            Generación y seguimiento de cotizaciones para clientes y reparaciones.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Nueva Cotización"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-brand-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold text-ink-800 border-b border-ink-100 pb-2">
            Elaborar Cotización
          </h3>

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
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.apellido} (NIT: {c.nit_ci})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Orden de Servicio (Opcional)</label>
              <select
                value={formulario.id_orden}
                onChange={(e) => setFormulario((p) => ({ ...p, id_orden: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Ninguna --</option>
                {ordenes.map((o) => (
                  <option key={o.id_orden} value={o.id_orden}>
                    Orden #{o.id_orden} - {o.problema_reportado}
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
                <option value="">-- Sin Oferta --</option>
                {ofertas.map((of) => (
                  <option key={of.id_oferta} value={of.id_oferta}>
                    {of.of_nombre} ({of.porcentaje}% OFF)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Formulario de agregar línea */}
          <div className="rounded-lg bg-ink-50 p-3.5 border border-ink-100">
            <p className="text-xs font-semibold text-ink-800 mb-2">Detalle de Equipos / Repuestos Cotizados</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-ink-600">Equipo</label>
                <input
                  type="text"
                  placeholder="ej. Laptop HP Pavilion"
                  value={lineaTemp.equipo}
                  onChange={(e) => setLineaTemp((prev) => ({ ...prev, equipo: e.target.value }))}
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-ink-600">Repuesto / Servicio</label>
                <input
                  type="text"
                  placeholder="ej. Pantalla 15.6 LCD"
                  value={lineaTemp.repuesto}
                  onChange={(e) => setLineaTemp((prev) => ({ ...prev, repuesto: e.target.value }))}
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-ink-600">Precio Unitario (Bs)</label>
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
                  + Agregar Fila
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-ink-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 text-ink-600 border-b border-ink-100">
                <tr>
                  <th className="px-3 py-2">Equipo</th>
                  <th className="px-3 py-2">Repuesto / Servicio</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {formulario.detalles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-ink-400">
                      No se han agregado elementos a cotizar.
                    </td>
                  </tr>
                ) : (
                  formulario.detalles.map((d) => (
                    <tr key={d.id_detalle_cotizacion} className="border-b border-ink-100 last:border-0">
                      <td className="px-3 py-2 font-medium text-ink-900">{d.equipo}</td>
                      <td className="px-3 py-2 text-ink-700">{d.repuesto}</td>
                      <td className="px-3 py-2 text-ink-700">Bs {d.precio.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleQuitarLinea(d.id_detalle_cotizacion)}
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
              Subtotal: Bs {subtotalLineas.toFixed(2)}{" "}
              {montoDescuento > 0 && (
                <span className="text-xs font-normal text-green-600 ml-2">
                  (Descuento {porcentajeDescuento}%: -Bs {montoDescuento.toFixed(2)})
                </span>
              )}{" "}
              ➔ Total: <span className="text-brand-600 text-lg font-bold">Bs {totalFinal.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Generando…" : "Guardar Cotización"}
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
          placeholder="Buscar por cliente u orden..."
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
            renderResumen={(cot) => (
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    Cotización #{cot.id_cotizacion} · {cot.cliente?.nombre} {cot.cliente?.apellido}
                  </p>
                  <p className="text-xs text-ink-400">
                    Registrado: {cot.fecha_registro} · Vence: {cot.fecha_cad}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-brand-700">
                    Bs {Number(cot.monto_total).toFixed(2)}
                  </span>
                  {cot.oferta && (
                    <p className="text-[10px] text-green-600 font-medium">{cot.oferta.of_nombre}</p>
                  )}
                </div>
              </div>
            )}
            renderDetalle={(cot) => (
              <div className="space-y-2">
                {cot.orden && (
                  <p className="text-xs text-ink-500">
                    <span className="font-semibold">Orden Vinculada:</span> #{cot.orden.id_orden} - {cot.orden.problema_reportado}
                  </p>
                )}
                <table className="w-full text-left text-xs">
                  <thead className="text-xs text-ink-400 border-b border-ink-100">
                    <tr>
                      <th className="pb-2 font-medium">Equipo</th>
                      <th className="pb-2 font-medium">Repuesto / Servicio</th>
                      <th className="pb-2 font-medium">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cot.detalle?.map((linea) => (
                      <tr key={linea.id_detalle_cotizacion} className="border-b border-ink-100/50 last:border-0">
                        <td className="py-1 text-ink-800">{linea.equipo}</td>
                        <td className="py-1 text-ink-600">{linea.repuesto}</td>
                        <td className="py-1 font-medium text-ink-900">Bs {Number(linea.precio).toFixed(2)}</td>
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
