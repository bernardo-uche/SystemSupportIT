import comprasMock from "../../mocks/Modulo2/compras.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_compras";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comprasMock));
    return [...comprasMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comprasMock));
    return [...comprasMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarCompras() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/compras`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de compras.");
  return res.json();
}

export async function crearCompra(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = {
      id_compra: Date.now(),
      n_documento: datos.n_documento || `COMP-${Math.floor(100 + Math.random() * 900)}`,
      fecha: datos.fecha || new Date().toISOString().split("T")[0],
      forma_pago: datos.forma_pago || "Efectivo",
      observacion: datos.observacion || "",
      total_compra: Number(datos.total_compra) || 0,
      proveedor: datos.proveedor || { id_proveedor: datos.id_proveedor, nombre: "Proveedor Seleccionado" },
      detalle: datos.detalle || [],
      estado: 1,
    };
    const nuevaLista = [nueva, ...list];
    saveStoredMock(nuevaLista);
    return nueva;
  }

  const res = await fetch(`${API_URL}/compras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo registrar la compra.");
  return res.json();
}

export async function anularCompra(id) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const compra = list.find((c) => c.id_compra === id);
    if (compra) {
      compra.estado = 0;
      saveStoredMock(list);
    }
    return true;
  }

  const res = await fetch(`${API_URL}/compras/${id}/anular`, {
    method: "PATCH",
  });

  if (!res.ok) throw new Error("No se pudo anular la compra.");
  return true;
}