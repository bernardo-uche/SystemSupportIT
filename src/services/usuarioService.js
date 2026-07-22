import usuariosMock from "../mocks/users.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_KEY = "sistema_mock_usuarios";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMock() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosMock));
    return [...usuariosMock];
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosMock));
    return [...usuariosMock];
  }
}

function saveStoredMock(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listarUsuarios() {
  if (USE_MOCK) {
    await delay(300);
    return getStoredMock();
  }

  const res = await fetch(`${API_URL}/usuarios`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios.");
  return res.json();
}

export async function crearUsuario(datos) {
  if (USE_MOCK) {
    await delay(400);
    const list = getStoredMock();
    const iniciales = (datos.nombre || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const nuevo = {
      id: Date.now(),
      nombre: datos.nombre,
      email: datos.email,
      password: datos.password || "123456",
      rol: { id: datos.rol === "administrador" ? 1 : 2, nombre: datos.rol },
      avatarIniciales: iniciales || "US",
      activo: datos.activo !== undefined ? Boolean(datos.activo) : true,
    };
    const nuevaLista = [nuevo, ...list];
    saveStoredMock(nuevaLista);
    return nuevo;
  }

  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error("No se pudo crear el usuario.");
  return res.json();
}

export async function cambiarEstadoUsuario(id, activo) {
  if (USE_MOCK) {
    await delay(300);
    const list = getStoredMock();
    const user = list.find((u) => u.id === id);
    if (user) {
      user.activo = activo;
      saveStoredMock(list);
    }
    return user;
  }

  const res = await fetch(`${API_URL}/usuarios/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo }),
  });
  if (!res.ok) throw new Error("No se pudo cambiar estado del usuario.");
  return res.json();
}
