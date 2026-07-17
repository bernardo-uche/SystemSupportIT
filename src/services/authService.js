import usuariosMock from "../mocks/users.mock.json";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Simula la latencia de una petición real, para que la UI se comporte
// igual (loading, spinners) que cuando conectemos la API de verdad.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generarTokenFalso(usuario) {
  return btoa(`${usuario.id}:${usuario.email}:${Date.now()}`);
}

/**
 * Intenta iniciar sesión.
 * Devuelve { usuario, token } o lanza un Error con un mensaje ya listo
 * para mostrar en el formulario.
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    await delay(600);

    const usuario = usuariosMock.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!usuario || usuario.password !== password) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    if (!usuario.activo) {
      throw new Error("Este usuario está inactivo. Contacta al administrador.");
    }

    // eslint-disable-next-line no-unused-vars
    const { password: _omit, ...usuarioSinPassword } = usuario;

    return {
      usuario: usuarioSinPassword,
      token: generarTokenFalso(usuario),
    };
  }

  // --- Integración real con el backend ---
  // Cuando el equipo de backend entregue el endpoint de login, el contrato
  // esperado es: POST /auth/login { email, password } -> { usuario, token }
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "No se pudo iniciar sesión.");
  }

  return res.json();
}


export async function logout() {
  if (!USE_MOCK) {
    await fetch(`${API_URL}/auth/logout`, { method: "POST" }).catch(() => {});
  }
}
