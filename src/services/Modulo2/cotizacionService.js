import cotizacionesMock from "../../mocks/Modulo2/cotizaciones.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_cotizaciones";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizarCotizacion(c) {
  const clienteNombre = typeof c.cliente === "string"
    ? c.cliente
    : c.cliente
    ? `${c.cliente.nombre || ""} ${c.cliente.apellido || ""}`.trim()
    : "Cliente General";

  const ofertaNombre = typeof c.oferta === "string"
    ? c.oferta
    : c.oferta
    ? c.oferta.nombre || c.oferta.of_nombre || null
    : null;

  const listaDetalles = Array.isArray(c.detalles)
    ? c.detalles
    : Array.isArray(c.detalle)
    ? c.detalle
    : [];

  const detallesNormalizados = listaDetalles.map((d, index) => {
    const cant = Number(d.cantidad || 1);
    const pu = Number(d.precio_unitario !== undefined ? d.precio_unitario : d.precio || 0);
    const sub = Number(d.subtotal !== undefined ? d.subtotal : cant * pu);
    return {
      id_detalle: d.id_detalle || d.id_detalle_cotizacion || (Date.now() + index),
      concepto: d.concepto || d.repuesto || d.equipo || "Repuesto / Servicio",
      cantidad: cant,
      precio_unitario: pu,
      subtotal: sub,
    };
  });

  const subtotalSum = detallesNormalizados.reduce((acc, d) => acc + d.subtotal, 0);
  const totalVal = Number(c.total !== undefined ? c.total : c.monto_total !== undefined ? c.monto_total : subtotalSum);

  return {
    id_cotizacion: c.id_cotizacion,
    nro_cotizacion: c.nro_cotizacion || `COT-${String(c.id_cotizacion).padStart(4, "0")}`,
    cliente: clienteNombre,
    fecha_registro: c.fecha_registro || new Date().toISOString().split("T")[0],
    subtotal: subtotalSum,
    descuento: Number(c.descuento || 0),
    total: totalVal,
    oferta: ofertaNombre,
    observacion: c.observacion || "",
    detalles: detallesNormalizados,
  };
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const iniciales = cotizacionesMock.map(normalizarCotizacion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
    return iniciales;
  }
  try {
    const parsed = JSON.parse(data);
    return parsed.map(normalizarCotizacion);
  } catch {
    const iniciales = cotizacionesMock.map(normalizarCotizacion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
    return iniciales;
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarCotizaciones() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/cotizaciones`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de cotizaciones.");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizarCotizacion) : [];
}

export async function crearCotizacion(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = normalizarCotizacion({
      id_cotizacion: Date.now(),
      ...datos,
    });
    const nuevaLista = [nueva, ...list];
    saveStoredMock(nuevaLista);
    return nueva;
  }

  const res = await fetch(`${API_URL}/cotizaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear la cotización.");
  const created = await res.json();
  return normalizarCotizacion(created);
}
