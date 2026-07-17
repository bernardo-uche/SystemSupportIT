import usuariosMock from "../mocks/users.mock.json";

export default function Usuarios() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">
        Usuarios
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Solo visible para el rol administrador. Datos ficticios.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosMock.map((u) => (
              <tr key={u.id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3 text-ink-900">{u.nombre}</td>
                <td className="px-4 py-3 text-ink-600">{u.email}</td>
                <td className="px-4 py-3 capitalize text-ink-600">{u.rol.nombre}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.activo
                        ? "bg-green-50 text-green-700"
                        : "bg-ink-100 text-ink-400"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
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