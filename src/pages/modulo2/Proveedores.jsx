import { useEffect, useState } from "react";
import { listarProveedores, crearProveedor } from "../../services/Modulo2";

const FORMULARIO_VACIO = { nombre: "", nit: "", correo: "", celular: "", departamento: "" };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    listarProveedores()
      .then(setProveedores)
      .finally(() => setCargando(false));
  }, []);

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      const nuevo = await crearProveedor(formulario);
      setProveedores((actual) => [nuevo, ...actual]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarFormulario(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Proveedores</h1>
          <p className="mt-1 text-sm text-ink-400">Datos ficticios de ejemplo.</p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {mostrarFormulario ? "Cancelar" : "Nuevo proveedor"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-ink-100 bg-white p-4 sm:grid-cols-2"
        >
          <Campo
            label="Nombre"
            value={formulario.nombre}
            onChange={(v) => actualizarCampo("nombre", v)}
            required
          />
          <Campo
            label="NIT"
            value={formulario.nit}
            onChange={(v) => actualizarCampo("nit", v)}
            required
          />
          <Campo
            label="Correo"
            type="email"
            value={formulario.correo}
            onChange={(v) => actualizarCampo("correo", v)}
            required
          />
          <Campo
            label="Celular"
            value={formulario.celular}
            onChange={(v) => actualizarCampo("celular", v)}
          />
          <Campo
            label="Departamento"
            value={formulario.departamento}
            onChange={(v) => actualizarCampo("departamento", v)}
          />

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Guardar proveedor"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">NIT</th>
              <th className="px-4 py-3 font-medium">Departamento</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  Cargando proveedores…
                </td>
              </tr>
            )}

            {!cargando &&
              proveedores.map((p) => (
                <tr key={p.id_proveedor} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-900">{p.nombre}</td>
                  <td className="px-4 py-3 text-ink-600">{p.nit}</td>
                  <td className="px-4 py-3 text-ink-600">{p.departamento}</td>
                  <td className="px-4 py-3 text-ink-600">
                    <p>{p.correo}</p>
                    <p className="text-xs text-ink-400">{p.celular}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.estado ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      {p.estado ? "Activo" : "Inactivo"}
                    </span>
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
      <label className="mb-1.5 block text-sm font-medium text-ink-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}