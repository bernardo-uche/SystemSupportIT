import loteStockMock from "../../mocks/Modulo4/loteStock.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_lote_stock";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loteStockMock));
    return [...loteStockMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loteStockMock));
    return [...loteStockMock];
  }
}

export async function listarLotesStock() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/lotes-stock`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de lotes de stock.");
  return res.json();
}
