import equiposMock from "../../mocks/Modulo1/equipos.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_equipos";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equiposMock));
    return [...equiposMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equiposMock));
    return [...equiposMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarEquipos() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/equipos`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de equipos.");
  return res.json();
}

export async function crearEquipo(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nuevo = {
      id_equipo: Date.now(),
      numero_serie: datos.numero_serie || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      estado: datos.estado !== undefined ? Number(datos.estado) : 1,
      ...datos,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/equipos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo crear el equipo.");
  return res.json();
}

export async function cambiarEstadoEquipo(id, estado) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const item = list.find((e) => e.id_equipo === id);
    if (item) {
      item.estado = estado ? 1 : 0;
      saveStoredMock(list);
    }
    return item;
  }

  const res = await fetch(`${API_URL}/equipos/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: estado ? 1 : 0 }),
  });
  if (!res.ok) throw new Error("No se pudo cambiar el estado del equipo.");
  return res.json();
}