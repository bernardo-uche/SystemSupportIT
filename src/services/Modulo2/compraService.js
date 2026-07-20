import comprasMock from "../../mocks/Modulo2/compras.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarCompras() {
  if (USE_MOCK) {
    await delay(400);
    return comprasMock;
  }

  const res = await fetch(`${API_URL}/compras`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de compras.");
  return res.json();
}