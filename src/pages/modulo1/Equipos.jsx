import { useEffect, useState } from "react";
import { listarEquipos, crearEquipo, cambiarEstadoEquipo } from "../../services/Modulo1/equipoService";
import { listarMarcas } from "../../services/Modulo1/marcaService";
import { listarModelos } from "../../services/Modulo1/modeloService";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_VACIO = {
  numero_serie: "",
  id_marca: "",
  id_modelo: "",
  color: "Negro",
  estado: 1,
};

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  function cargarDatos() {
    setCargando(true);
    Promise.all([listarEquipos(), listarMarcas(), listarModelos()])
      .then(([equiposData, marcasData, modelosData]) => {
        setEquipos(equiposData);
        setMarcas(marcasData);
        setModelos(modelosData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  const marcaPorId = Object.fromEntries(marcas.map((m) => [m.id_marca, m.nombre_marca]));
  const modeloPorId = Object.fromEntries(modelos.map((m) => [m.id_modelo, m.nombre_modelo]));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.numero_serie) return alert("Ingresa el número de serie.");

    setGuardando(true);
    try {
      const payload = {
        numero_serie: formulario.numero_serie,
        id_marca: Number(formulario.id_marca) || 1,
        id_modelo: Number(formulario.id_modelo) || 1,
        color: formulario.color,
        estado: Number(formulario.estado),
      };

      const nuevo = await crearEquipo(payload);
      setEquipos((prev) => [nuevo, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarModal(false);
    } catch (err) {
      alert(err.message || "Error al crear el equipo.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleEstado(eq) {
    const nuevoEstado = eq.estado ? 0 : 1;
    try {
      await cambiarEstadoEquipo(eq.id_equipo, nuevoEstado);
      setEquipos((prev) =>
        prev.map((item) => (item.id_equipo === eq.id_equipo ? { ...item, estado: nuevoEstado } : item))
      );
    } catch (err) {
      alert(err.message || "Error al cambiar estado.");
    }
  }

  const equiposFiltrados = equipos.filter((eq) => {
    const q = busqueda.toLowerCase();
    const marca = (marcaPorId[eq.id_marca] || "").toLowerCase();
    const modelo = (modeloPorId[eq.id_modelo] || "").toLowerCase();
    return (
      eq.numero_serie?.toLowerCase().includes(q) ||
      eq.color?.toLowerCase().includes(q) ||
      marca.includes(q) ||
      modelo.includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Equipos de Clientes</h1>
          <p className="mt-1 text-sm text-ink-400">
            Registro de computadoras, laptops y dispositivos ingresados al servicio técnico.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Registrar Equipo
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {mostrarModal && (
        <Modal titulo="Registrar Nuevo Equipo" onCerrar={() => setMostrarModal(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">N° de Serie / Código Único</label>
              <input
                type="text"
                placeholder="ej. SN-LAP-9921"
                value={formulario.numero_serie}
                onChange={(e) => setFormulario((p) => ({ ...p, numero_serie: e.target.value }))}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Marca</label>
              <select
                value={formulario.id_marca}
                onChange={(e) => setFormulario((p) => ({ ...p, id_marca: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Seleccionar Marca --</option>
                {marcas.map((m) => (
                  <option key={m.id_marca} value={m.id_marca}>
                    {m.nombre_marca}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Modelo</label>
              <select
                value={formulario.id_modelo}
                onChange={(e) => setFormulario((p) => ({ ...p, id_modelo: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">-- Seleccionar Modelo --</option>
                {modelos.map((m) => (
                  <option key={m.id_modelo} value={m.id_modelo}>
                    {m.nombre_modelo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Color</label>
              <input
                type="text"
                placeholder="ej. Negro, Gris"
                value={formulario.color}
                onChange={(e) => setFormulario((p) => ({ ...p, color: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado Inicial</label>
              <select
                value={formulario.estado}
                onChange={(e) => setFormulario((p) => ({ ...p, estado: Number(e.target.value) }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo / En reparación</option>
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
                {guardando ? "Guardando…" : "Guardar Equipo"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar por N° de serie, marca, modelo o color..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{equiposFiltrados.length} equipos</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">N° de Serie</th>
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

            {!cargando && equiposFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-400">
                  No se encontraron equipos registrados.
                </td>
              </tr>
            )}

            {!cargando &&
              equiposFiltrados.map((eq) => (
                <tr key={eq.id_equipo} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-700">{eq.numero_serie}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {marcaPorId[eq.id_marca] || "Marca General"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {modeloPorId[eq.id_modelo] || "Modelo Estándar"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{eq.color || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleEstado(eq)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        eq.estado ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {eq.estado ? "Activo" : "Inactivo"}
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