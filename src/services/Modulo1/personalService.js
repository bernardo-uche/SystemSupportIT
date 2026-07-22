import personalMock from "../../mocks/Modulo1/personal.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarPersonal() {
  if (USE_MOCK) {
    await delay(400);
    return personalMock;
  }
  const res = await fetch(`${API_URL}/personal`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de personal.");
  return res.json();
}

export async function crearPersonal(datos) {
  if (USE_MOCK) {
    await delay(400);
    return { id_personal: Date.now(), estado: 1, ...datos };
  }
  const res = await fetch(`${API_URL}/personal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo crear el personal.");
  return res.json();
}

export async function actualizarPersonal(id, datos) {
  if (USE_MOCK) {
    await delay(400);
    return { id_personal: id, estado: 1, ...datos };
  }
  const res = await fetch(`${API_URL}/personal/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el personal.");
  return res.json();
}

export async function eliminarPersonal(id) {
  if (USE_MOCK) {
    await delay(300);
    return true;
  }
  const res = await fetch(`${API_URL}/personal/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar el personal.");
  return true;
}