import marcasMock from "../../mocks/Modulo1/marcas.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listarMarcas() {
  if (USE_MOCK) {
    await delay(300);
    return marcasMock;
  }

  const res = await fetch(`${API_URL}/marcas`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de marcas.");
  return res.json();
}