import ventasMock from "../../mocks/Modulo3/ventas.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarVentas() {
  if (USE_MOCK) {
    await delay(400);
    return ventasMock;
  }

  const res = await fetch(`${API_URL}/ventas`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de ventas.");
  return res.json();
}