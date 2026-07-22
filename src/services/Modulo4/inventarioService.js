import inventarioMock from "../../mocks/Modulo4/inventario.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_inventario";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventarioMock));
    return [...inventarioMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventarioMock));
    return [...inventarioMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarInventario() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/inventario`);
  if (!res.ok) throw new Error("No se pudo obtener el inventario.");
  return res.json();
}

export async function actualizarUbicacionInventario(id, ubicacion, stockMinimo, stockMaximo) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const item = list.find((i) => i.id_inventario === id);
    if (item) {
      if (ubicacion !== undefined) item.ubicacion = ubicacion;
      if (stockMinimo !== undefined) item.stock_minimo = Number(stockMinimo);
      if (stockMaximo !== undefined) item.stock_maximo = Number(stockMaximo);
      saveStoredMock(list);
    }
    return item;
  }

  const res = await fetch(`${API_URL}/inventario/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ubicacion, stock_minimo: stockMinimo, stock_maximo: stockMaximo }),
  });

  if (!res.ok) throw new Error("No se pudo actualizar el inventario.");
  return res.json();
}
