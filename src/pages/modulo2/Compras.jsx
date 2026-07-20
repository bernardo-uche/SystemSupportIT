import { useEffect, useState } from "react";
import { listarCompras } from "../../services/Modulo2";
import TablaExpandible from "../../components/TablaExpandible.jsx";

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarCompras()
      .then(setCompras)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-400">
        Cargando compras…
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">Compras</h1>
      <p className="mt-1 text-sm text-ink-400">
        Datos ficticios de ejemplo. Haz clic en una compra para ver el detalle.
      </p>

      <div className="mt-6">
        <TablaExpandible
          items={compras}
          obtenerId={(c) => c.id_compra}
          renderResumen={(compra) => (
            <div>
              <p className="text-sm font-medium text-ink-900">
                {compra.n_documento} · {compra.proveedor.nombre}
              </p>
              <p className="text-xs text-ink-400">
                {compra.fecha} · {compra.forma_pago} · Bs {compra.total_compra.toFixed(2)}
              </p>
            </div>
          )}
          renderDetalle={(compra) => (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-400">
                <tr>
                  <th className="pb-2 font-medium">Repuesto</th>
                  <th className="pb-2 font-medium">Cantidad</th>
                  <th className="pb-2 font-medium">Precio</th>
                  <th className="pb-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {compra.detalle.map((linea) => (
                  <tr key={linea.id_detalle_compra}>
                    <td className="py-1 text-ink-800">{linea.repuesto}</td>
                    <td className="py-1 text-ink-600">{linea.cantidad}</td>
                    <td className="py-1 text-ink-600">Bs {linea.precio.toFixed(2)}</td>
                    <td className="py-1 text-ink-600">Bs {linea.sub_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />
      </div>
    </div>
  );
}