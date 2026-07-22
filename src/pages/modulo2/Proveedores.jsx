import { useEffect, useState } from "react";
import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  cambiarEstadoProveedor,
  eliminarProveedor,
} from "../../services/Modulo2";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_VACIO = { nombre: "", nit: "", correo: "", celular: "", departamento: "", direccion: "", estado: 1 };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarProveedores();
  }, []);

  function cargarProveedores() {
    setCargando(true);
    listarProveedores()
      .then(setProveedores)
      .finally(() => setCargando(false));
  }

  function abrirFormularioCrear() {
    setProveedorEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(p) {
    setProveedorEditando(p);
    setFormulario({
      nombre: p.nombre || "",
      nit: p.nit || "",
      correo: p.correo || "",
      celular: p.celular || "",
      departamento: p.departamento || "",
      direccion: p.direccion || "",
      estado: p.estado !== undefined ? Number(p.estado) : 1,
    });
    setMostrarFormulario(true);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (proveedorEditando) {
        const actualizado = await actualizarProveedor(proveedorEditando.id_proveedor, formulario);
        setProveedores((actual) =>
          actual.map((p) => (p.id_proveedor === proveedorEditando.id_proveedor ? { ...p, ...actualizado } : p))
        );
      } else {
        const nuevo = await crearProveedor(formulario);
        setProveedores((actual) => [nuevo, ...actual]);
      }
      setFormulario(FORMULARIO_VACIO);
      setProveedorEditando(null);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleEstado(p) {
    const nuevoEstado = p.estado ? 0 : 1;
    try {
      await cambiarEstadoProveedor(p.id_proveedor, nuevoEstado);
      setProveedores((actual) =>
        actual.map((item) => (item.id_proveedor === p.id_proveedor ? { ...item, estado: nuevoEstado } : item))
      );
    } catch (err) {
      alert(err.message || "Error al cambiar estado.");
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) return;
    try {
      await eliminarProveedor(id);
      setProveedores((actual) => actual.filter((p) => p.id_proveedor !== id));
    } catch (err) {
      alert(err.message || "Error al eliminar.");
    }
  }

  const proveedoresFiltrados = proveedores.filter((p) => {
    const q = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.nit?.toLowerCase().includes(q) ||
      p.correo?.toLowerCase().includes(q) ||
      p.departamento?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Proveedores</h1>
          <p className="mt-1 text-sm text-ink-400">
            Gestión completa de proveedores de piezas y herramientas.
          </p>
        </div>
        <button
          onClick={abrirFormularioCrear}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nuevo proveedor
        </button>
      </div>

      {mostrarFormulario && (
        <Modal
          titulo={proveedorEditando ? "Editar Proveedor" : "Nuevo Proveedor"}
          onCerrar={() => setMostrarFormulario(false)}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo
              label="Nombre o Razón Social"
              value={formulario.nombre}
              onChange={(v) => actualizarCampo("nombre", v)}
              required
            />
            <Campo
              label="NIT / CI"
              value={formulario.nit}
              onChange={(v) => actualizarCampo("nit", v)}
              required
            />
            <Campo
              label="Correo Electrónico"
              type="email"
              value={formulario.correo}
              onChange={(v) => actualizarCampo("correo", v)}
              required
            />
            <Campo
              label="Teléfono / Celular"
              value={formulario.celular}
              onChange={(v) => actualizarCampo("celular", v)}
            />
            <Campo
              label="Departamento"
              value={formulario.departamento}
              onChange={(v) => actualizarCampo("departamento", v)}
            />
            <Campo
              label="Dirección"
              value={formulario.direccion}
              onChange={(v) => actualizarCampo("direccion", v)}
            />

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado</label>
              <select
                value={formulario.estado}
                onChange={(e) => actualizarCampo("estado", Number(e.target.value))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2 mt-3 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : proveedorEditando ? "Actualizar Proveedor" : "Guardar Proveedor"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, NIT, correo o departamento…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{proveedoresFiltrados.length} registros</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">NIT</th>
              <th className="px-4 py-3 font-medium">Departamento</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  Cargando proveedores…
                </td>
              </tr>
            )}

            {!cargando && proveedoresFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron proveedores.
                </td>
              </tr>
            )}

            {!cargando &&
              proveedoresFiltrados.map((p) => (
                <tr key={p.id_proveedor} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-medium text-ink-900">{p.nombre}</td>
                  <td className="px-4 py-3 text-ink-600">{p.nit}</td>
                  <td className="px-4 py-3 text-ink-600">{p.departamento || "-"}</td>
                  <td className="px-4 py-3 text-ink-600">
                    <p>{p.correo}</p>
                    <p className="text-xs text-ink-400">{p.celular}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleEstado(p)}
                      title="Haz clic para cambiar el estado"
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        p.estado ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {p.estado ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirFormularioEditar(p)}
                        className="rounded px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id_proveedor)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}