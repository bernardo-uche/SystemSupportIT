import clientesMock from "../../mocks/Modulo1/clientes.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarClientes() {
  if (USE_MOCK) {
    await delay(400);
    return clientesMock;
  }
  const res = await fetch(`${API_URL}/clientes`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de clientes.");
  return res.json();
}

export async function crearCliente(datos) {
  if (USE_MOCK) {
    await delay(400);
    return { id_cliente: Date.now(), estado: 1, ...datos };
  }
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo crear el cliente.");
  return res.json();
}

export async function actualizarCliente(id, datos) {
  if (USE_MOCK) {
    await delay(400);
    return { id_cliente: id, estado: 1, ...datos };
  }
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el cliente.");
  return res.json();
}

export async function eliminarCliente(id) {
  if (USE_MOCK) {
    await delay(300);
    return true;
  }
  const res = await fetch(`${API_URL}/clientes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar el cliente.");
  return true;
}