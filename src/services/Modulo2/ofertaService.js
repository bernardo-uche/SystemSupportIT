import ofertasMock from "../../mocks/Modulo2/ofertas.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_ofertas";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertasMock));
    return [...ofertasMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertasMock));
    return [...ofertasMock];
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
  return res.json();
}

export async function crearOferta(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = {
      id_oferta: Date.now(),
      estado: 1,
      ...datos,
    };
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
  return res.json();
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
