import mantenimientosMock from "../../mocks/Modulo5/mantenimientos.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_mantenimientos";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mantenimientosMock));
    return [...mantenimientosMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mantenimientosMock));
    return [...mantenimientosMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarMantenimientos() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/mantenimientos`);
  if (!res.ok) throw new Error("No se pudo obtener el catálogo de mantenimientos.");
  return res.json();
}

export async function crearMantenimiento(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nuevo = {
      id_mantenimiento: Date.now(),
      tarifa_base: Number(datos.tarifa_base) || 0,
      tiempo_estimado: Number(datos.tiempo_estimado) || 60,
      estado: 1,
      ...datos,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/mantenimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear el mantenimiento.");
  return res.json();
}
