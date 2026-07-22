import equiposMock from "../../mocks/Modulo1/equipos.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarEquipos() {
  if (USE_MOCK) {
    await delay(400);
    return equiposMock;
  }

  const res = await fetch(`${API_URL}/equipos`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de equipos.");
  return res.json();
}