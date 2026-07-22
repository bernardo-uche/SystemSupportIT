import trabajosMock from "../../mocks/Modulo5/trabajos.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_trabajos_mantenimiento";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trabajosMock));
    return [...trabajosMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trabajosMock));
    return [...trabajosMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarTrabajosMantenimiento() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/trabajos-mantenimiento`);
  if (!res.ok) throw new Error("No se pudieron obtener los trabajos de mantenimiento.");
  return res.json();
}

export async function crearTrabajoMantenimiento(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nuevo = {
      id_trabajo_mantenimiento: Date.now(),
      estado: "pendiente",
      ...datos,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/trabajos-mantenimiento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear el trabajo de mantenimiento.");
  return res.json();
}

export async function cambiarEstadoTrabajo(id, nuevoEstado) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const trabajo = list.find((t) => t.id_trabajo_mantenimiento === id);
    if (trabajo) {
      trabajo.estado = nuevoEstado;
      const ahora = new Date().toISOString().replace("T", " ").substring(0, 19);
      if (nuevoEstado === "en_proceso" && !trabajo.fecha_inicio) trabajo.fecha_inicio = ahora;
      if (nuevoEstado === "finalizado" && !trabajo.fecha_fin) trabajo.fecha_fin = ahora;
      saveStoredMock(list);
    }
    return trabajo;
  }

  const res = await fetch(`${API_URL}/trabajos-mantenimiento/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  if (!res.ok) throw new Error("No se pudo cambiar el estado del trabajo.");
  return res.json();
}
