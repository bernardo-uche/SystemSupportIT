import ordenesMock from "../../mocks/Modulo1/ordenes.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarOrdenes() {
  if (USE_MOCK) {
    await delay(400);
    return ordenesMock;
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