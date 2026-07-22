import ordenesMock from "../../mocks/Modulo1/ordenes.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_ordenes";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenesMock));
    return [...ordenesMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenesMock));
    return [...ordenesMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarOrdenes() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/ordenes_servicio`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("No se pudo obtener la lista de órdenes.");
  return res.json();
}

export async function crearOrdenServicio(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = {
      id_orden: Date.now(),
      fecha_ingreso: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      ...datos,
    };
    const nuevaLista = [nueva, ...list];
    saveStoredMock(nuevaLista);
    return nueva;
  }

  const res = await fetch(`${API_URL}/ordenes_servicio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo crear la orden.");
  return res.json();
}