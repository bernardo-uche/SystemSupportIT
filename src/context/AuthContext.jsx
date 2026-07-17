import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "sistema_auth";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      try {
        const { usuario, token } = JSON.parse(guardado);
        setUsuario(usuario);
        setToken(token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setCargandoSesion(false);
  }, []);

  async function login({ email, password }) {
    const { usuario, token } = await authService.login({ email, password });
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ usuario, token }));
    return usuario;
  }

  async function logout() {
    await authService.logout();
    setUsuario(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function tieneRol(...roles) {
    if (!usuario) return false;
    return roles.includes(usuario.rol?.nombre);
  }

  const value = {
    usuario,
    token,
    estaAutenticado: Boolean(usuario),
    cargandoSesion,
    login,
    logout,
    tieneRol,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}