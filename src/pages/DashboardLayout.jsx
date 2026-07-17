import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Inicio", icon: "🏠", roles: null },
  { to: "/dashboard/usuarios", label: "Usuarios", icon: "👥", roles: ["administrador"] },
  { to: "/dashboard/reportes", label: "Reportes", icon: "📊", roles: ["administrador", "supervisor"] },
];

export default function DashboardLayout() {
  const { usuario, logout, tieneRol } = useAuth();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const itemsVisibles = NAV_ITEMS.filter(
    (item) => !item.roles || tieneRol(...item.roles)
  );

  return (
    <div className="min-h-screen bg-ink-50 lg:grid lg:grid-cols-[16rem_1fr]">
      {sidebarAbierto && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-ink-900 text-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 px-6 font-[var(--font-display)] text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            S
          </span>
          Sistema
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {itemsVisibles.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={() => setSidebarAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-ink-100/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-100/40">
            Rol actual
          </p>
          <p className="text-sm font-medium capitalize">{usuario?.rol?.nombre}</p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-50 lg:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="hidden text-sm text-ink-400 lg:block">
            Panel interno · datos ficticios mientras el backend no esté conectado
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink-900">{usuario?.nombre}</p>
              <p className="text-xs capitalize text-ink-400">{usuario?.rol?.nombre}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {usuario?.avatarIniciales}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-ink-100 px-3 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
            >
              Salir
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}