import { useEffect, useState } from "react";
import { listarPersonal, crearPersonal, actualizarPersonal, eliminarPersonal } from "../../services/Modulo1/personalService";
import Modal from "../../components/Modal.jsx";
import Campo from "../../components/Campo.jsx";

const FORMULARIO_VACIO = { nombre: "", apellido: "", cargo: "", telefono: "", correo: "", estado: 1 };

export default function Personal() {
  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setCargando(true);
    listarPersonal()
      .then(setPersonal)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  function abrirCrear() {
    setEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setModalAbierto(true);
  }

  function abrirEditar(p) {
    setEditando(p);
    setFormulario({
      nombre: p.nombre,
      apellido: p.apellido,
      cargo: p.cargo,
      telefono: p.telefono || "",
      correo: p.correo,
      estado: p.estado !== undefined ? Number(p.estado) : 1,
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
      if (editando) {
        const actualizado = await actualizarPersonal(editando.id_personal, formulario);
        setPersonal((actual) =>
          actual.map((p) => (p.id_personal === editando.id_personal ? { ...p, ...actualizado } : p))
        );
      } else {
        const nuevo = await crearPersonal(formulario);
        setPersonal((actual) => [nuevo, ...actual]);
      }
      setModalAbierto(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(p) {
    if (!window.confirm(`¿Eliminar a ${p.nombre} ${p.apellido}?`)) return;
    try {
      await eliminarPersonal(p.id_personal);
      setPersonal((actual) => actual.filter((x) => x.id_personal !== p.id_personal));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Personal</h1>
          <p className="mt-1 text-sm text-ink-400">Gestión de personal del servicio técnico.</p>
        </div>
        <button
          onClick={abrirCrear}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Nuevo Personal
        </button>
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
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-400">Cargando personal…</td>
              </tr>
            )}

            {!cargando &&
              personal.map((p) => (
                <tr key={p.id_personal} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-900 font-medium">{p.nombre} {p.apellido}</td>
                  <td className="px-4 py-3 text-ink-600">{p.cargo}</td>
                  <td className="px-4 py-3 text-ink-600">{p.telefono || "-"}</td>
                  <td className="px-4 py-3 text-ink-600">{p.correo}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.estado ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"}`}>
                      {p.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => abrirEditar(p)} className="text-xs font-medium text-brand-600 hover:text-brand-700">Editar</button>
                      <button onClick={() => handleEliminar(p)} className="text-xs font-medium text-red-600 hover:text-red-700">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? "Editar personal" : "Nuevo personal"} onCerrar={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Nombre" value={formulario.nombre} onChange={(v) => actualizarCampo("nombre", v)} required />
            <Campo label="Apellido" value={formulario.apellido} onChange={(v) => actualizarCampo("apellido", v)} required />
            <Campo label="Cargo" value={formulario.cargo} onChange={(v) => actualizarCampo("cargo", v)} required />
            <Campo label="Teléfono" value={formulario.telefono} onChange={(v) => actualizarCampo("telefono", v)} />
            <Campo label="Correo" type="email" value={formulario.correo} onChange={(v) => actualizarCampo("correo", v)} required />

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

            <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setModalAbierto(false)} className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">Cancelar</button>
              <button type="submit" disabled={guardando} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}