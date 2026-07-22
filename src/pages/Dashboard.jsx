import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listarClientes, listarOrdenes } from "../services/Modulo1";

const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  finalizada: "Finalizada",
  Anulado: "Anulado",
};

const COLOR_BARRA_ESTADO = {
  pendiente: "bg-amber-400",
  en_proceso: "bg-blue-400",
  finalizada: "bg-green-400",
  Anulado: "bg-red-300",
};

export default function Dashboard() {
  const { usuario, tieneRol } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([listarClientes(), listarOrdenes()])
      .then(([clientesData, ordenesData]) => {
        setClientes(clientesData);
        setOrdenes(ordenesData);
      })
      .finally(() => setCargando(false));
  }, []);

  // Todos los cálculos se derivan de los datos, no de números fijos.
  const resumen = useMemo(() => {
    const clientesActivos = clientes.filter((c) => c.estado === 1).length;

    const ordenesActivas = ordenes.filter((o) => o.estado !== "Anulado");

    const conteoPorEstado = ordenes.reduce((acc, o) => {
      acc[o.estado] = (acc[o.estado] || 0) + 1;
      return acc;
    }, {});

    const montoEnProceso = ordenesActivas
      .filter((o) => o.estado !== "finalizada")
      .reduce((total, o) => total + o.costo, 0);

    const proximasEntregas = [...ordenesActivas]
      .filter((o) => o.estado !== "finalizada")
      .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega))
      .slice(0, 5);

    return {
      totalClientes: clientes.length,
      clientesActivos,
      totalOrdenes: ordenes.length,
      conteoPorEstado,
      montoEnProceso,
      proximasEntregas,
    };
  }, [clientes, ordenes]);

  const esGestion = tieneRol("administrador", "supervisor");

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-400">
        Cargando datos del panel…
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-900">
        Hola, {usuario?.nombre ? usuario.nombre.split(" ")[0] : "Usuario"}
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Resumen calculado a partir de los datos ficticios de Clientes y Órdenes de servicio.
      </p>

      {/* Tarjetas principales */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta
          titulo="Clientes registrados"
          valor={resumen.totalClientes}
          nota={`${resumen.clientesActivos} activos`}
        />
        <Tarjeta
          titulo="Órdenes totales"
          valor={resumen.totalOrdenes}
          nota={`${resumen.conteoPorEstado.pendiente || 0} pendientes`}
        />
        <Tarjeta
          titulo="En proceso"
          valor={resumen.conteoPorEstado.en_proceso || 0}
          nota="Órdenes activas ahora"
        />
        {esGestion && (
          <Tarjeta
            titulo="Monto en curso"
            valor={`Bs ${resumen.montoEnProceso.toFixed(2)}`}
            nota="Saldo de órdenes"
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Distribución de órdenes por estado */}
        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-ink-800">Órdenes por estado</p>
          <div className="mt-4 space-y-3">
            {Object.entries(ETIQUETAS_ESTADO).map(([clave, etiqueta]) => {
              const cantidad = resumen.conteoPorEstado[clave] || 0;
              const porcentaje = resumen.totalOrdenes
                ? Math.round((cantidad / resumen.totalOrdenes) * 100)
                : 0;

              return (
                <div key={clave}>
                  <div className="flex items-center justify-between text-xs text-ink-600">
                    <span>{etiqueta}</span>
                    <span>{cantidad}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={`h-full rounded-full ${COLOR_BARRA_ESTADO[clave]}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas entregas */}
        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-ink-800">Próximas entregas</p>
          {resumen.proximasEntregas.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">No hay entregas pendientes.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {resumen.proximasEntregas.map((o) => (
                <li key={o.id_orden} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-ink-900">
                      {o.cliente?.nombre || "Cliente"} {o.cliente?.apellido || ""}
                    </p>
                    <p className="text-xs text-ink-400">{o.problema_reportado}</p>
                  </div>
                  <span className="text-xs text-ink-400">{o.fecha_entrega}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-5 text-sm text-brand-800">
        Este panel ya consume <code>clienteService</code> y <code>ordenService</code>.
        Cuando el backend entregue esos endpoints, cambia <code>VITE_USE_MOCK=false</code>{" "}
        en <code>.env</code> — este componente no necesita ningún otro cambio.
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor, nota }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-ink-400">{titulo}</p>
      <p className="mt-2 text-3xl font-semibold text-ink-900">{valor}</p>
      <p className="mt-1 text-xs text-ink-400">{nota}</p>
    </div>
  );
}