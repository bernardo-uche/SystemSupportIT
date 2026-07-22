import herramientasMock from "../../mocks/Modulo5/herramientas.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_herramientas";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(herramientasMock));
    return [...herramientasMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(herramientasMock));
    return [...herramientasMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarHerramientas() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/herramientas`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de herramientas.");
  return res.json();
}

export async function crearHerramienta(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = {
      id_herramienta: Date.now(),
      nro_serie_interno: datos.nro_serie_interno || `H-${Math.floor(100 + Math.random() * 900)}`,
      estado_fisico: datos.estado_fisico || "bueno",
      estado: 1,
      ...datos,
    };
    const nuevaLista = [nueva, ...list];
    saveStoredMock(nuevaLista);
    return nueva;
  }

  const res = await fetch(`${API_URL}/herramientas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear la herramienta.");
  return res.json();
}

export async function actualizarEstadoFisicoHerramienta(id, nuevoEstadoFisico) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const item = list.find((h) => h.id_herramienta === id);
    if (item) {
      item.estado_fisico = nuevoEstadoFisico;
      saveStoredMock(list);
    }
    return item;
  }

  const res = await fetch(`${API_URL}/herramientas/${id}/estado-fisico`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado_fisico: nuevoEstadoFisico }),
  });

  if (!res.ok) throw new Error("No se pudo actualizar el estado físico de la herramienta.");
  return res.json();
}
