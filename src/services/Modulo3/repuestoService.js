import repuestosMock from "../../mocks/Modulo3/repuestos.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_repuestos";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repuestosMock));
    return [...repuestosMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repuestosMock));
    return [...repuestosMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarRepuestos() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/repuestos`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de repuestos.");
  return res.json();
}

export async function crearRepuesto(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nuevo = {
      id_repuesto: Date.now(),
      codigo: datos.codigo || `REP-${Math.floor(100 + Math.random() * 900)}`,
      stock_actual: Number(datos.stock_actual) || 0,
      precio_compra: Number(datos.precio_compra) || 0,
      precio_venta: Number(datos.precio_venta) || 0,
      estado: 1,
      ...datos,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/repuestos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo crear el repuesto.");
  return res.json();
}

export async function actualizarRepuesto(id, datos) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const idx = list.findIndex((r) => r.id_repuesto === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...datos };
      saveStoredMock(list);
      return list[idx];
    }
    return { id_repuesto: id, ...datos };
  }

  const res = await fetch(`${API_URL}/repuestos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el repuesto.");
  return res.json();
}