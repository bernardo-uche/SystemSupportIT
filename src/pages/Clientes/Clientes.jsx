import { useEffect, useState } from "react";
import { listarClientes } from "../../services/Modulo1/clienteService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .finally(() => setCargando(false));
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Clientes</h1>
          <p className="mt-1 text-sm text-ink-400">Datos ficticios de ejemplo.</p>
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre…"
          className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-64"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">NIT/CI</th>
              <th className="px-4 py-3 font-medium">Estado</th>
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

            {!cargando && clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron clientes.
                </td>
              </tr>
            )}

            {clientesFiltrados.map((c) => (
              <tr key={c.id_cliente} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3 text-ink-900">{c.nombre} {c.apellido}</td>
                <td className="px-4 py-3 text-ink-600">{c.correo}</td>
                <td className="px-4 py-3 text-ink-600">{c.telefono}</td>
                <td className="px-4 py-3 text-ink-600">{c.nit_ci}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      c.estado
                        ? "bg-green-50 text-green-700"
                        : "bg-ink-100 text-ink-400"
                    }`}
                  >
                    {c.estado ? "Activo" : "Inactivo"}
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