import { useEffect, useState } from "react";
import { listarVentas } from "../services/ventaService";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandida, setExpandida] = useState(null);

  useEffect(() => {
    listarVentas()
      .then(setVentas)
      .finally(() => setCargando(false));
  }, []);

  function alternarExpandida(id) {
    setExpandida((actual) => (actual === id ? null : id));
  }

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-400">
        Cargando ventas…
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">Ventas</h1>
      <p className="mt-1 text-sm text-ink-400">
        Datos ficticios de ejemplo. Haz clic en una venta para ver el detalle.
      </p>

      <div className="mt-6 space-y-3">
        {ventas.map((venta) => {
          const abierta = expandida === venta.id_venta;

          return (
            <div
              key={venta.id_venta}
              className="overflow-hidden rounded-xl border border-ink-100 bg-white"
            >
              <button
                onClick={() => alternarExpandida(venta.id_venta)}
                className="flex w-full flex-col gap-2 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {venta.cliente.nombre} {venta.cliente.apellido}
                  </p>
                  <p className="text-xs text-ink-400">
                    {venta.fecha} · {venta.metodo_pago} · vendió {venta.vendedor.nombre}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink-900">
                    Bs {venta.total.toFixed(2)}
                  </span>
                  <span
                    className={`text-ink-400 transition-transform ${abierta ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </div>
              </button>

              {abierta && (
                <div className="border-t border-ink-100 bg-ink-50 px-4 py-3">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-ink-400">
                      <tr>
                        <th className="pb-2 font-medium">Repuesto</th>
                        <th className="pb-2 font-medium">Cantidad</th>
                        <th className="pb-2 font-medium">Precio unit.</th>
                        <th className="pb-2 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venta.detalle.map((linea) => (
                        <tr key={linea.id_detalle_venta}>
                          <td className="py-1 text-ink-800">{linea.repuesto}</td>
                          <td className="py-1 text-ink-600">{linea.cantidad}</td>
                          <td className="py-1 text-ink-600">
                            Bs {linea.precio_unitario.toFixed(2)}
                          </td>
                          <td className="py-1 text-ink-600">Bs {linea.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}