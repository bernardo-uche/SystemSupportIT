import { useEffect, useState } from "react";
import { listarClientes, crearCliente,actualizarCliente, eliminarCliente } from "../../services/Modulo1";
import Modal from "../../components/Modal.jsx";
import Campo from "../../components/Campo.jsx";

const FORMULARIO_VACIO = { nombre: "", apellido: "", correo: "", telefono: "", direccion: "", nit_ci: "" };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null); // null = creando
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  function cargarClientes() {
    setCargando(true);
    listarClientes()
      .then(setClientes)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  function abrirCrear() {
    setClienteEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setModalAbierto(true);
  }

  function abrirEditar(cliente) {
    setClienteEditando(cliente);
    setFormulario({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      nit_ci: cliente.nit_ci,
    });
    setModalAbierto(true);
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (clienteEditando) {
        const actualizado = await actualizarCliente(clienteEditando.id_cliente, formulario);
        setClientes((actual) =>
          actual.map((c) => (c.id_cliente === clienteEditando.id_cliente ? { ...c, ...actualizado } : c))
        );
      } else {
        const nuevo = await crearCliente(formulario);
        setClientes((actual) => [nuevo, ...actual]);
      }
      setModalAbierto(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(cliente) {
    const confirmado = window.confirm(`¿Eliminar a ${cliente.nombre} ${cliente.apellido}?`);
    if (!confirmado) return;

    try {
      await eliminarCliente(cliente.id_cliente);
      setClientes((actual) => actual.filter((c) => c.id_cliente !== cliente.id_cliente));
    } catch (err) {
      setError(err.message);
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Clientes</h1>
          <p className="mt-1 text-sm text-ink-400">Conectado a la API del Módulo 1.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-52"
          />
          <button
            onClick={abrirCrear}
            className="whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">NIT/CI</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  Cargando clientes…
                </td>
              </tr>
            )}

            {!cargando &&
              clientesFiltrados.map((c) => (
                <tr key={c.id_cliente} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-900">{c.nombre} {c.apellido}</td>
                  <td className="px-4 py-3 text-ink-600">{c.correo}</td>
                  <td className="px-4 py-3 text-ink-600">{c.nit_ci}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.estado ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      {c.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(c)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
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

      {modalAbierto && (
        <Modal
          titulo={clienteEditando ? "Editar cliente" : "Nuevo cliente"}
          onCerrar={() => setModalAbierto(false)}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Nombre" value={formulario.nombre} onChange={(v) => actualizarCampo("nombre", v)} required />
            <Campo label="Apellido" value={formulario.apellido} onChange={(v) => actualizarCampo("apellido", v)} required />
            <Campo label="Correo" type="email" value={formulario.correo} onChange={(v) => actualizarCampo("correo", v)} required />
            <Campo label="Teléfono" value={formulario.telefono} onChange={(v) => actualizarCampo("telefono", v)} />
            <Campo label="NIT/CI" value={formulario.nit_ci} onChange={(v) => actualizarCampo("nit_ci", v)} required />
            <Campo label="Dirección" value={formulario.direccion} onChange={(v) => actualizarCampo("direccion", v)} />

            <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}