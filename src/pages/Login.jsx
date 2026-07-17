import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import images from "../assets/images.jpg";

export default function Login() {
  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const destino = location.state?.from?.pathname || "/dashboard";

  if (estaAutenticado) {
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa tu correo y contraseña.");
      return;
    }

    setCargando(true);
    try {
      await login({ email, password });
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div
        className="relative hidden flex-col justify-between overflow-hidden bg-cover bg-center p-12 text-white lg:flex"
        style={{ backgroundImage: `url(${images})` }}
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-black/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
            S
          </span>
          SERVICE TICKET
        </div>

        {/*<div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Un solo panel para todos los módulos.
          </h1>
          <p className="mt-4 text-brand-100">
            Cada equipo entrega su parte, aquí se ve el sistema completo:
            roles, permisos y datos en un mismo lugar.
          </p>
        </div> */}

        <p className="relative z-10 text-sm text-brand-100/70">
          © {new Date().getFullYear()} Proyecto Sistema — Panel interno
        </p>
      </div>

      <div className="flex items-center justify-center bg-ink-50 px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-ink-900 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              S
            </span>
            Sistema
          </div>

          <h2 className="text-2xl font-semibold text-ink-900">Inicia sesión</h2>
          <p className="mt-1 text-sm text-ink-400">
            Ingresa tus credenciales para acceder al panel.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@sistema.com"
                className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-ink-800">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  {mostrarPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

         {/* <div className="mt-8 rounded-lg border border-ink-100 bg-white px-4 py-3 text-xs text-ink-400">
            <p className="mb-1.5 font-medium text-ink-600">
              Credenciales de prueba (datos ficticios)
            </p>
            <p>admin@sistema.com / admin123 — administrador</p>
            <p>supervisor@sistema.com / super123 — supervisor</p>
            <p>usuario@sistema.com / user123 — usuario</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}