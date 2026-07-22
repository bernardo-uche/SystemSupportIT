import { useState } from "react";
import Modal from "../components/Modal.jsx";

const REPORTES_INICIALES = [
  {
    id_reporte: 1,
    tipo: "Reporte de Compras y Proveedores",
    fecha_generacion: "2026-01-20 14:30",
    rango: "2026-01-01 a 2026-01-20",
    formato: "PDF",
    estado: "Generado",
    solicitante: "Administrador Sistema",
  },
  {
    id_reporte: 2,
    tipo: "Reporte de Kardex e Inventario",
    fecha_generacion: "2026-01-18 10:15",
    rango: "2026-01-01 a 2026-01-18",
    formato: "Excel",
    estado: "Generado",
    solicitante: "Supervisor TI",
  },
  {
    id_reporte: 3,
    tipo: "Reporte de Trabajos de Mantenimiento",
    fecha_generacion: "2026-01-15 17:00",
    rango: "2026-01-01 a 2026-01-15",
    formato: "PDF",
    estado: "Generado",
    solicitante: "Administrador Sistema",
  },
];

export default function Reportes() {
  const [reportes, setReportes] = useState(() => {
    const local = localStorage.getItem("sistema_mock_reportes");
    return local ? JSON.parse(local) : REPORTES_INICIALES;
  });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState({
    tipo: "Reporte de Compras y Proveedores",
    fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    fecha_fin: new Date().toISOString().split("T")[0],
    formato: "PDF",
    observacion: "",
  });
  const [generando, setGenerando] = useState(false);

  function guardarReportes(nuevaLista) {
    setReportes(nuevaLista);
    localStorage.setItem("sistema_mock_reportes", JSON.stringify(nuevaLista));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setGenerando(true);

    setTimeout(() => {
      const nuevo = {
        id_reporte: Date.now(),
        tipo: formulario.tipo,
        fecha_generacion: new Date().toISOString().replace("T", " ").substring(0, 16),
        rango: `${formulario.fecha_inicio} a ${formulario.fecha_fin}`,
        formato: formulario.formato,
        estado: "Generado",
        solicitante: "Usuario Actual",
      };

      guardarReportes([nuevo, ...reportes]);
      setGenerando(false);
      setMostrarModal(false);
    }, 500);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Módulo de Reportes</h1>
          <p className="mt-1 text-sm text-ink-400">
            Generación y descarga de informes ejecutivos de Compras, Ventas, Inventario y Mantenimiento.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + Generar Nuevo Reporte
        </button>
      </div>

      {/* Tarjetas resumen de reportes */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-ink-400">Reportes Generados</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{reportes.length}</p>
          <p className="mt-1 text-xs text-green-600">✓ Disponibles para descarga</p>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-ink-400">Formato más Utilizado</p>
          <p className="mt-2 text-3xl font-bold text-brand-600">PDF</p>
          <p className="mt-1 text-xs text-ink-400">Exportación ejecutiva</p>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-ink-400">Última Generación</p>
          <p className="mt-2 text-base font-semibold text-ink-900">
            {reportes[0]?.fecha_generacion || "N/A"}
          </p>
          <p className="mt-1 text-xs text-ink-400">{reportes[0]?.tipo || "-"}</p>
        </div>
      </div>

      {mostrarModal && (
        <Modal titulo="Generar Nuevo Reporte Explicativo" onCerrar={() => setMostrarModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Tipo de Reporte</label>
              <select
                value={formulario.tipo}
                onChange={(e) => setFormulario((p) => ({ ...p, tipo: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="Reporte de Compras y Proveedores">Reporte de Compras y Proveedores</option>
                <option value="Reporte de Kardex e Inventario">Reporte de Kardex e Inventario</option>
                <option value="Reporte de Trabajos de Mantenimiento">Reporte de Trabajos de Mantenimiento</option>
                <option value="Reporte de Ventas y Cotizaciones">Reporte de Ventas y Cotizaciones</option>
                <option value="Reporte de Órdenes de Servicio Técnico">Reporte de Órdenes de Servicio Técnico</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Inicio</label>
                <input
                  type="date"
                  value={formulario.fecha_inicio}
                  onChange={(e) => setFormulario((p) => ({ ...p, fecha_inicio: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-800">Fecha Fin</label>
                <input
                  type="date"
                  value={formulario.fecha_fin}
                  onChange={(e) => setFormulario((p) => ({ ...p, fecha_fin: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Formato de Salida</label>
              <select
                value={formulario.formato}
                onChange={(e) => setFormulario((p) => ({ ...p, formato: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="PDF">Documento PDF (.pdf)</option>
                <option value="Excel">Hoja de Cálculo Excel (.xlsx)</option>
                <option value="CSV">Archivo CSV (.csv)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Observaciones o Notas</label>
              <textarea
                rows="2"
                placeholder="Notas adicionales para la portada del informe..."
                value={formulario.observacion}
                onChange={(e) => setFormulario((p) => ({ ...p, observacion: e.target.value }))}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={generando}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {generando ? "Generando Reporte…" : "Generar Reporte"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Historial de reportes generados */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Tipo de Reporte</th>
              <th className="px-4 py-3 font-medium">Fecha Generación</th>
              <th className="px-4 py-3 font-medium">Rango de Fechas</th>
              <th className="px-4 py-3 font-medium">Formato</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((rep) => (
              <tr key={rep.id_reporte} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-medium text-ink-900">{rep.tipo}</td>
                <td className="px-4 py-3 text-xs text-ink-500">{rep.fecha_generacion}</td>
                <td className="px-4 py-3 text-xs text-ink-600">{rep.rango}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-brand-50 px-2 py-0.5 font-mono text-xs font-bold text-brand-700">
                    {rep.formato}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    {rep.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => alert(`Descargando ${rep.tipo} en formato ${rep.formato}...`)}
                    className="rounded px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                  >
                    ⬇️ Descargar
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