import ventasMock from "../../mocks/Modulo3/ventas.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_ventas";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ventasMock));
    return [...ventasMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ventasMock));
    return [...ventasMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarVentas() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/ventas`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de ventas.");
  return res.json();
}

export async function crearVenta(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nueva = {
      id_venta: Date.now(),
      fecha: new Date().toISOString().split("T")[0],
      n_factura: datos.n_factura || `VEN-${Math.floor(100 + Math.random() * 900)}`,
      total: Number(datos.total) || 0,
      estado: 1,
      ...datos,
    };
    const nuevaLista = [nueva, ...list];
    saveStoredMock(nuevaLista);
    return nueva;
  }

  const res = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo registrar la venta.");
  return res.json();
}