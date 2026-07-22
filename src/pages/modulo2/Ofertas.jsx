import { useEffect, useState } from "react";
import { listarOfertas, crearOferta, cambiarEstadoOferta } from "../../services/Modulo2";

const FORMULARIO_VACIO = {
  of_nombre: "",
  descripcion: "",
  porcentaje: 10,
  fecha_inc: new Date().toISOString().split("T")[0],
  fecha_fin: "",
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
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formulario.of_nombre) return alert("Ingresa el nombre de la oferta.");
    if (formulario.porcentaje <= 0 || formulario.porcentaje > 100)
      return alert("El porcentaje debe ser entre 1% y 100%.");

    setGuardando(true);
    try {
      const nueva = await crearOferta({
        ...formulario,
        porcentaje: Number(formulario.porcentaje),
      });
      setOfertas((prev) => [nueva, ...prev]);
      setFormulario(FORMULARIO_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.message || "Error al crear la oferta.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleEstado(oferta) {
    const nuevoEstado = oferta.estado ? 0 : 1;
    try {
      await cambiarEstadoOferta(oferta.id_oferta, nuevoEstado);
      setOfertas((prev) =>
        prev.map((o) => (o.id_oferta === oferta.id_oferta ? { ...o, estado: nuevoEstado } : o))
      );
    } catch (err) {
      alert(err.message || "Error al cambiar estado.");
    }
  }

  const ofertasFiltradas = ofertas.filter((o) => {
    const q = busqueda.toLowerCase();
    return o.of_nombre?.toLowerCase().includes(q) || o.descripcion?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Ofertas y Promociones</h1>
          <p className="mt-1 text-sm text-ink-400">
            Gestión de descuentos y promociones temporales para piezas y servicios.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Nueva Oferta"}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-brand-200 bg-white p-5 shadow-sm space-y-3"
        >
          <h3 className="text-sm font-semibold text-ink-800 border-b border-ink-100 pb-2">
            Registrar Nueva Oferta
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Nombre de Oferta</label>
              <input
                type="text"
                placeholder="ej. Descuento Verano TI"
                value={formulario.of_nombre}
                onChange={(e) => actualizarCampo("of_nombre", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Porcentaje de Descuento (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formulario.porcentaje}
                onChange={(e) => actualizarCampo("porcentaje", e.target.value)}
                required
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Inicio</label>
              <input
                type="date"
                value={formulario.fecha_inc}
                onChange={(e) => actualizarCampo("fecha_inc", e.target.value)}
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
              <label className="mb-1 block text-xs font-medium text-ink-800">Descripción / Detalles</label>
              <textarea
                rows="2"
                placeholder="Descripción de los productos aplicables o términos..."
                value={formulario.descripcion}
                onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Guardar Oferta"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar oferta por nombre o descripción…"
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
                  <h3 className="font-semibold text-ink-900 text-base">{o.of_nombre}</h3>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    -{o.porcentaje}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-600">{o.descripcion || "Sin descripción"}</p>
                <div className="mt-4 border-t border-ink-100 pt-3 text-xs text-ink-400 space-y-1">
                  <p>🗓️ Inicio: <span className="font-medium text-ink-700">{o.fecha_inc}</span></p>
                  <p>⌛ Vencimiento: <span className="font-medium text-ink-700">{o.fecha_fin}</span></p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                <button
                  onClick={() => handleToggleEstado(o)}
                  className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    o.estado ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {o.estado ? "Vigente" : "Inactiva"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
