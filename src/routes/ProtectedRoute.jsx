import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { estaAutenticado, cargandoSesion, tieneRol } = useAuth();
  const location = useLocation();

  if (cargandoSesion) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-50">
        <span className="text-sm text-ink-400">Cargando sesión…</span>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidos && !tieneRol(...rolesPermitidos)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}