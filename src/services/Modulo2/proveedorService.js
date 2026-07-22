import proveedoresMock from "../../mocks/Modulo2/proveedores.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_proveedores";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proveedoresMock));
    return [...proveedoresMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proveedoresMock));
    return [...proveedoresMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarProveedores() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/proveedores`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de proveedores.");
  return res.json();
}

export async function crearProveedor(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const nuevo = {
      id_proveedor: Date.now(),
      estado: 1,
      ...datos,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo crear el proveedor.");
  return res.json();
}

export async function actualizarProveedor(id, datos) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const index = list.findIndex((p) => p.id_proveedor === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...datos };
      saveStoredMock(list);
      return list[index];
    }
    return { id_proveedor: id, ...datos };
  }

  const res = await fetch(`${API_URL}/proveedores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("No se pudo actualizar el proveedor.");
  return res.json();
}

export async function cambiarEstadoProveedor(id, nuevoEstado) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const proveedor = list.find((p) => p.id_proveedor === id);
    if (proveedor) {
      proveedor.estado = nuevoEstado ? 1 : 0;
      saveStoredMock(list);
    }
    return { id_proveedor: id, estado: nuevoEstado ? 1 : 0 };
  }

  const res = await fetch(`${API_URL}/proveedores/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado ? 1 : 0 }),
  });

  if (!res.ok) throw new Error("No se pudo cambiar el estado del proveedor.");
  return res.json();
}

export async function eliminarProveedor(id) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const nuevaLista = list.filter((p) => p.id_proveedor !== id);
    saveStoredMock(nuevaLista);
    return true;
  }

  const res = await fetch(`${API_URL}/proveedores/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("No se pudo eliminar el proveedor.");
  return true;
}