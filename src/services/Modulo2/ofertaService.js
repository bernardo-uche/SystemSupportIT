import ofertasMock from "../../mocks/Modulo2/ofertas.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_ofertas";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizarOferta(o) {
  return {
    id_oferta: o.id_oferta,
    nombre: o.nombre || o.of_nombre || "Oferta Especial",
    descuento_porcentaje: Number(o.descuento_porcentaje || o.porcentaje || 0),
    fecha_inicio: o.fecha_inicio || o.fecha_inc || new Date().toISOString().split("T")[0],
    fecha_fin: o.fecha_fin || "2026-12-31",
    descripcion: o.descripcion || "",
    estado: o.estado !== undefined ? o.estado : 1,
  };
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const iniciales = ofertasMock.map(normalizarOferta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
    return iniciales;
  }
  try {
    const parsed = JSON.parse(data);
    return parsed.map(normalizarOferta);
  } catch {
    const iniciales = ofertasMock.map(normalizarOferta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
    return iniciales;
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarOfertas() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/ofertas`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de ofertas.");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizarOferta) : [];
}

export async function crearOferta(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = normalizarOferta({
      id_oferta: Date.now(),
      estado: 1,
      ...datos,
    });
    const nuevaLista = [nueva, ...list];
    saveStoredMock(nuevaLista);
    return nueva;
  }

  const res = await fetch(`${API_URL}/ofertas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear la oferta.");
  const created = await res.json();
  return normalizarOferta(created);
}

export async function cambiarEstadoOferta(id, nuevoEstado) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const oferta = list.find((o) => o.id_oferta === id);
    if (oferta) {
      oferta.estado = nuevoEstado ? 1 : 0;
      saveStoredMock(list);
    }
    return { id_oferta: id, estado: nuevoEstado ? 1 : 0 };
  }

  const res = await fetch(`${API_URL}/ofertas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado ? 1 : 0 }),
  });

  if (!res.ok) throw new Error("No se pudo cambiar el estado de la oferta.");
  return res.json();
}
