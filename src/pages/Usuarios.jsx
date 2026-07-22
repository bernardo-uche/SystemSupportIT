import { useEffect, useState } from "react";
import { listarUsuarios, crearUsuario, cambiarEstadoUsuario } from "../services/usuarioService";
import Modal from "../components/Modal.jsx";

const FORMULARIO_VACIO = {
  nombre: "",
  email: "",
  password: "",
  rol: "personal",
  activo: 1,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  function cargarUsuarios() {
    setCargando(true);
    listarUsuarios()
      .then(setUsuarios)
      .finally(() => setCargando(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.nombre || !formulario.email) return alert("Completa el nombre y correo.");

    setGuardando(true);
    try {
      const nuevo = await crearUsuario(formulario);
      setUsuarios((prev) => [nuevo, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarModal(false);
    } catch (err) {
      alert(err.message || "Error al crear usuario.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleEstado(u) {
    const nuevoEstado = !u.activo;
    try {
      await cambiarEstadoUsuario(u.id, nuevoEstado);
      setUsuarios((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, activo: nuevoEstado } : item))
      );
    } catch (err) {
      alert(err.message || "Error al cambiar estado.");
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    return u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-ink-400">
            Administración de cuentas de acceso, roles y permisos al sistema.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nuevo Usuario
        </button>
      </div>

      {mostrarModal && (
        <Modal titulo="Registrar Nuevo Usuario" onCerrar={() => setMostrarModal(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Nombre Completo</label>
              <input
                type="text"
                placeholder="ej. Roberto Gómez"
                value={formulario.nombre}
                onChange={(e) => setFormulario((p) => ({ ...p, nombre: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Correo Electrónico</label>
              <input
                type="email"
                placeholder="ej. roberto@sistema.com"
                value={formulario.email}
                onChange={(e) => setFormulario((p) => ({ ...p, email: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Contraseña Inicial</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formulario.password}
                onChange={(e) => setFormulario((p) => ({ ...p, password: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Rol de Sistema</label>
              <select
                value={formulario.rol}
                onChange={(e) => setFormulario((p) => ({ ...p, rol: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="administrador">Administrador</option>
                <option value="supervisor">Supervisor</option>
                <option value="personal">Personal / Técnico</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado Inicial</label>
              <select
                value={formulario.activo}
                onChange={(e) => setFormulario((p) => ({ ...p, activo: Number(e.target.value) }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2 mt-3 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Guardar Usuario"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar usuario por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{usuariosFiltrados.length} usuarios</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo Electrónico</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-400">
                  Cargando usuarios…
                </td>
              </tr>
            )}

            {!cargando && usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}

            {!cargando &&
              usuariosFiltrados.map((u) => (
                <tr key={u.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-medium text-ink-900">{u.nombre}</td>
                  <td className="px-4 py-3 text-ink-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-ink-600">{u.rol?.nombre || u.rol}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleEstado(u)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        u.activo ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}