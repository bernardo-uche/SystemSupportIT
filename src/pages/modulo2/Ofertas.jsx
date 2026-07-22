import { useEffect, useState } from "react";
import { listarOfertas, crearOferta, cambiarEstadoOferta } from "../../services/Modulo2";
import Modal from "../../components/Modal.jsx";

const FORMULARIO_VACIO = {
  nombre: "",
  descuento_porcentaje: 10,
  fecha_inicio: new Date().toISOString().split("T")[0],
  fecha_fin: "",
  descripcion: "",
  estado: 1,
};

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarOfertas();
  }, []);

  function cargarOfertas() {
    setCargando(true);
    listarOfertas()
      .then(setOfertas)
      .finally(() => setCargando(false));
  }

  function actualizarCampo(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.nombre) return alert("Ingresa el nombre de la oferta.");

    setGuardando(true);
    try {
      const nueva = await crearOferta(formulario);
      setOfertas((actual) => [nueva, ...actual]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al crear la oferta.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleEstado(o) {
    const nuevoEstado = o.estado ? 0 : 1;
    try {
      await cambiarEstadoOferta(o.id_oferta, nuevoEstado);
      setOfertas((actual) =>
        actual.map((item) => (item.id_oferta === o.id_oferta ? { ...item, estado: nuevoEstado } : item))
      );
    } catch (err) {
      alert(err.message || "Error al cambiar estado.");
    }
  }

  const ofertasFiltradas = ofertas.filter((o) => {
    const q = busqueda.toLowerCase();
    const nombre = (o.nombre || o.of_nombre || "").toLowerCase();
    const desc = (o.descripcion || "").toLowerCase();
    return nombre.includes(q) || desc.includes(q);
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Ofertas y Promociones</h1>
          <p className="mt-1 text-sm text-ink-400">
            Gestión de descuentos temporales para piezas, repuestos y servicios.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Nueva Oferta
        </button>
      </div>

      {mostrarFormulario && (
        <Modal titulo="Nueva Oferta / Promoción" onCerrar={() => setMostrarFormulario(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Nombre de la Oferta</label>
              <input
                type="text"
                placeholder="ej. Descuento Fin de Año"
                value={formulario.nombre}
                onChange={(e) => actualizarCampo("nombre", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Descuento (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formulario.descuento_porcentaje}
                onChange={(e) => actualizarCampo("descuento_porcentaje", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Estado Inicial</label>
              <select
                value={formulario.estado}
                onChange={(e) => actualizarCampo("estado", Number(e.target.value))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value={1}>Activo (Vigente)</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Inicio</label>
              <input
                type="date"
                value={formulario.fecha_inicio}
                onChange={(e) => actualizarCampo("fecha_inicio", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Fin</label>
              <input
                type="date"
                value={formulario.fecha_fin}
                onChange={(e) => actualizarCampo("fecha_fin", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-800">Descripción</label>
              <textarea
                rows="2"
                placeholder="Condiciones o alcance de la promoción..."
                value={formulario.descripcion}
                onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
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
                {guardando ? "Guardando…" : "Guardar Oferta"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar oferta por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-ink-100 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-ink-400">{ofertasFiltradas.length} ofertas</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cargando && (
          <div className="col-span-full py-12 text-center text-sm text-ink-400">
            Cargando ofertas…
          </div>
        )}

        {!cargando && ofertasFiltradas.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-ink-400">
            No se encontraron ofertas registradas.
          </div>
        )}

        {!cargando &&
          ofertasFiltradas.map((o) => (
            <div
              key={o.id_oferta}
              className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink-900 text-base">{o.nombre || o.of_nombre}</h3>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                    -{o.descuento_porcentaje || o.porcentaje}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-600">{o.descripcion || "Sin descripción"}</p>
                <div className="mt-3 text-xs text-ink-400">
                  <p>Vigencia: {o.fecha_inicio || o.fecha_inc} al {o.fecha_fin}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                <button
                  onClick={() => handleToggleEstado(o)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                    o.estado ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {o.estado ? "Activo (Vigente)" : "Inactivo"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
