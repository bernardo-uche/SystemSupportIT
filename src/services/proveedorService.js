import proveedoresMock from "../mocks/proveedores.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarProveedores() {
  if (USE_MOCK) {
    await delay(400);
    return proveedoresMock;
  }

  const res = await fetch(`${API_URL}/proveedores`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de proveedores.");
  return res.json();
}

export async function crearProveedor(datos) {
  if (USE_MOCK) {
    await delay(500);
    // Simula lo que haría el backend: le asigna un id nuevo y lo devuelve.
    const nuevo = {
      id_proveedor: Date.now(),
      estado: 1,
      ...datos,
    };
    return nuevo;
  }

  const res = await fetch(`${API_URL}/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear el proveedor.");
  return res.json();
}