import { useEffect, useMemo, useState } from "react";
import { listarRepuestos, crearRepuesto } from "../../services/Modulo3";
import Modal from "../../components/Modal.jsx";

const STOCK_MINIMO_ALERTA = 5;
const FORMULARIO_VACIO = {
  nombre: "",
  codigo: "",
  marca: "",
  categoriaNombre: "General",
  precio_venta: 0,
  precio_compra: 0,
  stock_actual: 10,
};

export default function Repuestos() {
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarRepuestos();
  }, []);

  function cargarRepuestos() {
    setCargando(true);
    listarRepuestos()
      .then(setRepuestos)
      .finally(() => setCargando(false));
  }

  const categorias = useMemo(() => {
    const nombres = repuestos.map((r) => r.categoria?.nombre || "General");
    return [...new Set(nombres)];
  }, [repuestos]);

  const repuestosFiltrados = repuestos.filter((r) => {
    const coincideNombre = r.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaSeleccionada === "todas" || (r.categoria?.nombre || "General") === categoriaSeleccionada;
    return coincideNombre && coincideCategoria;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.nombre) return alert("Ingresa el nombre del repuesto.");

    setGuardando(true);
    try {
      const nuevoPayload = {
        nombre: formulario.nombre,
        codigo: formulario.codigo || `REP-${Math.floor(100 + Math.random() * 900)}`,
        marca: formulario.marca || "Genérico",
        categoria: { id: Date.now(), nombre: formulario.categoriaNombre },
        precio_venta: Number(formulario.precio_venta),
        precio_compra: Number(formulario.precio_compra),
        stock: Number(formulario.stock_actual),
        stock_actual: Number(formulario.stock_actual),
      };

      const nuevo = await crearRepuesto(nuevoPayload);
      setRepuestos((prev) => [nuevo, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarModal(false);
    } catch (err) {
      alert(err.message || "Error al crear repuesto.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Repuestos</h1>
          <p className="mt-1 text-sm text-ink-400">Catálogo de piezas y componentes para venta y servicio.</p>
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
          <button
            onClick={() => setMostrarModal(true)}
            className="whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Nuevo Repuesto
          </button>
        </div>
      </div>

      {mostrarModal && (
        <Modal titulo="Nuevo Repuesto" onCerrar={() => setMostrarModal(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Nombre del Repuesto</label>
              <input
                type="text"
                placeholder="ej. Memoria RAM 8GB DDR4"
                value={formulario.nombre}
                onChange={(e) => setFormulario((p) => ({ ...p, nombre: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Código / Modelo</label>
              <input
                type="text"
                placeholder="ej. RAM-DDR4-8G"
                value={formulario.codigo}
                onChange={(e) => setFormulario((p) => ({ ...p, codigo: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Marca</label>
              <input
                type="text"
                placeholder="ej. Kingston"
                value={formulario.marca}
                onChange={(e) => setFormulario((p) => ({ ...p, marca: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Categoría</label>
              <input
                type="text"
                placeholder="ej. Memorias"
                value={formulario.categoriaNombre}
                onChange={(e) => setFormulario((p) => ({ ...p, categoriaNombre: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Precio Venta (Bs)</label>
              <input
                type="number"
                min="0"
                value={formulario.precio_venta}
                onChange={(e) => setFormulario((p) => ({ ...p, precio_venta: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Stock Inicial</label>
              <input
                type="number"
                min="0"
                value={formulario.stock_actual}
                onChange={(e) => setFormulario((p) => ({ ...p, stock_actual: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
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
                {guardando ? "Guardando…" : "Guardar Repuesto"}
              </button>
            </div>
          </form>
        </Modal>
      )}

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

            {repuestosFiltrados.map((r) => {
              const stockVal = r.stock !== undefined ? r.stock : r.stock_actual || 0;
              const catNombre = r.categoria?.nombre || r.categoriaNombre || "General";
              const precioVal = r.precio_venta !== undefined ? r.precio_venta : 0;

              return (
                <tr key={r.id_repuesto} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{r.nombre}</p>
                    <p className="text-xs text-ink-400">{r.codigo}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{catNombre}</td>
                  <td className="px-4 py-3 text-ink-600">{r.marca}</td>
                  <td className="px-4 py-3 text-ink-600">Bs {Number(precioVal).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <EstadoStock cantidad={stockVal} />
                  </td>
                </tr>
              );
            })}
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