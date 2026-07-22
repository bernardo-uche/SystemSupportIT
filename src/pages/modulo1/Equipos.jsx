import { useEffect, useState } from "react";
import { listarEquipos } from "../../services/Modulo1/equipoService";
import { listarMarcas } from "../../services/Modulo1/marcaService";
import { listarModelos } from "../../services/Modulo1/modeloService";

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listarEquipos(), listarMarcas(), listarModelos()])
      .then(([equiposData, marcasData, modelosData]) => {
        setEquipos(equiposData);
        setMarcas(marcasData);
        setModelos(modelosData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // "Diccionarios" para buscar nombre de marca/modelo por su id en O(1),
  // en vez de recorrer el array completo cada vez.
  const marcaPorId = Object.fromEntries(marcas.map((m) => [m.id_marca, m.nombre_marca]));
  const modeloPorId = Object.fromEntries(modelos.map((m) => [m.id_modelo, m.nombre_modelo]));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">Equipos</h1>
      <p className="mt-1 text-sm text-ink-400">
        Equipos registrados para servicio técnico.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">N° de serie</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  Cargando equipos…
                </td>
              </tr>
            )}

            {!cargando &&
              equipos.map((eq) => (
                <tr key={eq.id_equipo} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 text-ink-900">{eq.numero_serie}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {marcaPorId[eq.id_marca] || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {modeloPorId[eq.id_modelo] || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{eq.color}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        eq.estado ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      {eq.estado ? "Activo" : "Inactivo"}
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