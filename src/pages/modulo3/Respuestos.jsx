import { useEffect, useMemo, useState } from "react";
import { listarRepuestos } from "../../services/Modulo3";

const STOCK_MINIMO_ALERTA = 5;

export default function Repuestos() {
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");

  useEffect(() => {
    listarRepuestos()
      .then(setRepuestos)
      .finally(() => setCargando(false));
  }, []);

  // Lista única de categorías, calculada a partir de los repuestos que ya tenemos
  const categorias = useMemo(() => {
    const nombres = repuestos.map((r) => r.categoria.nombre);
    return [...new Set(nombres)];
  }, [repuestos]);

  const repuestosFiltrados = repuestos.filter((r) => {
    const coincideNombre = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaSeleccionada === "todas" || r.categoria.nombre === categoriaSeleccionada;
    return coincideNombre && coincideCategoria;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Repuestos</h1>
          <p className="mt-1 text-sm text-ink-400">Datos ficticios de ejemplo.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar repuesto…"
            className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-52"
          />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-48"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Repuesto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  Cargando repuestos…
                </td>
              </tr>
            )}

            {!cargando && repuestosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron repuestos.
                </td>
              </tr>
            )}

            {repuestosFiltrados.map((r) => (
              <tr key={r.id_repuesto} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-900">{r.nombre}</p>
                  <p className="text-xs text-ink-400">{r.codigo}</p>
                </td>
                <td className="px-4 py-3 text-ink-600">{r.categoria.nombre}</td>
                <td className="px-4 py-3 text-ink-600">{r.marca}</td>
                <td className="px-4 py-3 text-ink-600">Bs {r.precio_venta.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <EstadoStock cantidad={r.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EstadoStock({ cantidad }) {
  let estilos = "bg-green-50 text-green-700";
  let texto = `${cantidad} unidades`;

  if (cantidad === 0) {
    estilos = "bg-red-50 text-red-700";
    texto = "Sin stock";
  } else if (cantidad <= STOCK_MINIMO_ALERTA) {
    estilos = "bg-amber-50 text-amber-700";
    texto = `${cantidad} unidades (bajo)`;
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estilos}`}>
      {texto}
    </span>
  );
}