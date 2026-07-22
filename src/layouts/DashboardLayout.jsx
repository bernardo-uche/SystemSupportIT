import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const RUTA_PENDIENTE = "/dashboard/proximamente";

const NAV_SECTIONS = [
  {
    titulo: null, // sin encabezado, siempre visible arriba de todo
    items: [
      { label: "Inicio", to: "/dashboard", icon: "🏠", roles: null, estado: "listo" },
    ],
  },
  {
    titulo: "Servicio técnico",
    items: [
      { label: "Clientes", to: "/dashboard/clientes", icon: "🧑‍💼", roles: null, estado: "listo" },
      { label: "Órdenes de servicio", to: "/dashboard/ordenes", icon: "🛠️", roles: null, estado: "listo" },
      { label: "Equipos", to: "/dashboard/equipos", icon: "💻", roles: null, estado: "listo" },
      { label: "Personal", to: "/dashboard/personal", icon: "👨‍🔧", roles: ["administrador", "supervisor"], estado: "listo" },
    ],
  },
  {
    titulo: "Ventas",
    items: [
      { label: "Repuestos", to: "/dashboard/repuestos", icon: "🔧", roles: null, estado: "listo" },
      { label: "Ventas", to: "/dashboard/ventas", icon: "🧾", roles: null, estado: "listo" },
    ],
  },
  {
    titulo: "Compras",
    items: [
      { label: "Proveedores", to: "/dashboard/proveedores", icon: "🚚", roles: ["administrador", "supervisor"], estado: "listo" },
      { label: "Compras", to: "/dashboard/compras", icon: "📦", roles: ["administrador", "supervisor"], estado: "listo" },
      { label: "Ofertas", to: "ofertas", icon: "🏷️", roles: ["administrador", "supervisor"], estado: "pendiente" },
      { label: "Cotizaciones", to: "cotizaciones", icon: "📄", roles: null, estado: "pendiente" },
    ],
  },
  {
    titulo: "Mantenimiento",
    items: [
      { label: "Herramientas", to: "herramientas", icon: "🧰", roles: ["administrador", "supervisor"], estado: "pendiente" },
      { label: "Mantenimientos", to: "mantenimientos", icon: "🔩", roles: ["administrador", "supervisor"], estado: "pendiente" },
      { label: "Trabajos de mantenimiento", to: "trabajos", icon: "📋", roles: null, estado: "pendiente" },
    ],
  },
  {
    titulo: "Inventario",
    items: [
      { label: "Inventario", to: "inventario", icon: "📊", roles: ["administrador", "supervisor"], estado: "pendiente" },
      { label: "Kardex", to: "kardex", icon: "📈", roles: ["administrador", "supervisor"], estado: "pendiente" },
      { label: "Inventario físico", to: "inventario-fisico", icon: "🧮", roles: ["administrador"], estado: "pendiente" },
    ],
  },
  {
    titulo: "Administración",
    items: [
      { label: "Usuarios", to: "/dashboard/usuarios", icon: "👥", roles: ["administrador"], estado: "listo" },
      { label: "Reportes", to: "/dashboard/reportes", icon: "📊", roles: ["administrador", "supervisor"], estado: "listo" },
    ],
  },
];

export default function DashboardLayout() {
  const { usuario, logout, tieneRol } = useAuth();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  // Filtra por rol, y descarta secciones que se quedan sin ningún ítem visible
  const seccionesVisibles = NAV_SECTIONS.map((seccion) => ({
    ...seccion,
    items: seccion.items.filter((item) => !item.roles || tieneRol(...item.roles)),
  })).filter((seccion) => seccion.items.length > 0);

  return (
    <div className="min-h-screen bg-ink-50">
      {sidebarAbierto && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-hidden bg-ink-900 text-white transition-transform duration-200 ease-out ${
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="sticky top-0 z-10 flex h-16 items-center gap-2 bg-ink-900 px-6 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            S
          </span>
          Sistema
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto pb-4">
          <nav className="mt-2 flex-1 flex flex-col gap-1 px-3">
            {seccionesVisibles.map((seccion, index) => (
              <div key={seccion.titulo || `sin-titulo-${index}`} className="mt-3 first:mt-0">
                {seccion.titulo && (
                  <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-100/40">
                    {seccion.titulo}
                  </p>
                )}

                {seccion.items.map((item) => (
                  <ItemMenu
                    key={item.label}
                    item={item}
                    onNavegar={() => setSidebarAbierto(false)}
                  />
                ))}
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 bg-ink-900 p-4">
            <p className="text-xs uppercase tracking-wide text-ink-100/40">Rol actual</p>
            <p className="text-sm font-medium capitalize">{usuario?.rol?.nombre}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:ml-64">
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

function ItemMenu({ item, onNavegar }) {
  const esPendiente = item.estado === "pendiente";
  const destino = esPendiente ? RUTA_PENDIENTE : item.to;

  return (
    <NavLink
      to={destino}
      state={esPendiente ? { nombre: item.label } : undefined}
      end={item.to === "/dashboard"}
      onClick={onNavegar}
      className={({ isActive }) =>
        `flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive && !esPendiente
            ? "bg-brand-600 text-white"
            : "text-ink-100/70 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <span className="flex items-center gap-3">
        <span aria-hidden>{item.icon}</span>
        {item.label}
      </span>

      {esPendiente && (
        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          Pendiente
        </span>
      )}
    </NavLink>
  );
}