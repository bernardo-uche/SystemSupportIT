import inventarioFisicoMock from "../../mocks/Modulo4/inventarioFisico.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_inventario_fisico";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventarioFisicoMock));
    return [...inventarioFisicoMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventarioFisicoMock));
    return [...inventarioFisicoMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarInventariosFisicos() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/inventarios-fisicos`);
  if (!res.ok) throw new Error("No se pudieron obtener los registros de inventario físico.");
  return res.json();
}

export async function registrarInventarioFisico(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nuevo = {
      id_inventario_fisico: Date.now(),
      fecha_conteo: new Date().toISOString().replace("T", " ").substring(0, 19),
      ...datos,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/inventarios-fisicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo registrar el conteo de inventario físico.");
  return res.json();
}
